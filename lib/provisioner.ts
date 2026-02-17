/**
 * Provisioning Service
 * Orchestrates VPS creation, DNS setup, and OpenClaw installation
 */

import { createServer, waitForServer, generateCloudInit, HetznerServer } from './hetzner'
import { updateUser, findUserById, User } from './db'

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID
const XAI_API_KEY = process.env.XAI_API_KEY || process.env.GROK_API_KEY
const MOCK_DNS = !CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_MOCK_MODE === 'true'

export interface ProvisioningStatus {
  status: 'pending' | 'creating_vps' | 'configuring_dns' | 'installing' | 'complete' | 'failed'
  progress: number
  message: string
  error?: string
  vpsId?: number
  vpsIp?: string
  instanceUrl?: string
}

/**
 * Start provisioning process for a user
 */
export async function provisionUserInstance(userId: string): Promise<void> {
  console.log(`[PROVISIONER] Starting provisioning for user: ${userId}`)
  
  try {
    // Get user details
    const user = findUserById(userId)
    if (!user) {
      throw new Error(`User ${userId} not found`)
    }

    // Update status: creating VPS
    updateUser(userId, {
      provisioningStatus: 'creating_vps'
    })

    // Step 1: Create VPS
    console.log(`[PROVISIONER] Creating VPS for ${user.xUsername}`)
    const subdomain = user.xUsername.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    
    const cloudInit = generateCloudInit({
      xaiApiKey: XAI_API_KEY || '',
      username: user.xUsername,
      subdomain
    })

    const serverResponse = await createServer({
      name: `clawdet-${subdomain}`,
      server_type: 'cx11', // Smallest instance: 1 vCPU, 2GB RAM
      image: 'ubuntu-22.04',
      location: 'fsn1', // Falkenstein, Germany
      labels: {
        'project': 'clawdet',
        'user': user.xUsername,
        'user_id': userId
      },
      user_data: cloudInit
    })

    console.log(`[PROVISIONER] VPS created: ${serverResponse.server.id}`)
    
    // Save VPS ID
    updateUser(userId, {
      hetznerVpsId: serverResponse.server.id.toString()
    })

    // Step 2: Wait for VPS to be ready
    console.log(`[PROVISIONER] Waiting for VPS to be ready...`)
    const server = await waitForServer(serverResponse.server.id, 180000) // 3 minutes max
    const vpsIp = server.public_net.ipv4.ip
    
    console.log(`[PROVISIONER] VPS ready at IP: ${vpsIp}`)

    // Step 3: Configure DNS
    updateUser(userId, {
      provisioningStatus: 'configuring_dns'
    })

    console.log(`[PROVISIONER] Configuring DNS: ${subdomain}.clawdet.com → ${vpsIp}`)
    await createDnsRecord(subdomain, vpsIp)

    // Step 4: Installation (happens via cloud-init in background)
    updateUser(userId, {
      provisioningStatus: 'installing'
    })

    console.log(`[PROVISIONER] OpenClaw installation started via cloud-init`)
    
    // Wait a bit for cloud-init to start
    await new Promise(resolve => setTimeout(resolve, 10000))

    // Step 5: Mark complete
    const instanceUrl = `https://${subdomain}.clawdet.com`
    
    updateUser(userId, {
      provisioningStatus: 'complete',
      instanceUrl
    })

    console.log(`[PROVISIONER] ✅ Provisioning complete! ${instanceUrl}`)

  } catch (error) {
    console.error(`[PROVISIONER] ❌ Provisioning failed:`, error)
    
    updateUser(userId, {
      provisioningStatus: 'failed'
    })
    
    throw error
  }
}

/**
 * Create DNS A record via Cloudflare API
 */
async function createDnsRecord(subdomain: string, ip: string): Promise<void> {
  if (MOCK_DNS) {
    console.log(`[DNS MOCK] Creating A record: ${subdomain}.clawdet.com → ${ip}`)
    return
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'A',
        name: subdomain,
        content: ip,
        ttl: 120,
        proxied: true // Enable Cloudflare proxy for SSL
      })
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Cloudflare API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  console.log(`[DNS] Created record: ${subdomain}.clawdet.com → ${ip}`)
}

/**
 * Get provisioning status for a user
 */
export function getProvisioningStatus(userId: string): ProvisioningStatus | null {
  const user = findUserById(userId)
  if (!user) {
    return null
  }

  const statusMap: Record<string, { progress: number; message: string }> = {
    'pending': { progress: 0, message: 'Provisioning queued...' },
    'creating_vps': { progress: 25, message: 'Creating your VPS server...' },
    'configuring_dns': { progress: 50, message: 'Setting up your domain...' },
    'installing': { progress: 75, message: 'Installing OpenClaw...' },
    'complete': { progress: 100, message: 'Your instance is ready!' },
    'failed': { progress: 0, message: 'Provisioning failed' }
  }

  const status = user.provisioningStatus || 'pending'
  const info = statusMap[status] || statusMap['pending']

  return {
    status: status as any,
    progress: info.progress,
    message: info.message,
    vpsId: user.hetznerVpsId ? parseInt(user.hetznerVpsId) : undefined,
    instanceUrl: user.instanceUrl
  }
}

/**
 * Background provisioning job (call this asynchronously)
 */
export async function startProvisioningJob(userId: string): Promise<void> {
  // Run in background - don't await
  provisionUserInstance(userId).catch(error => {
    console.error(`[PROVISIONER] Background job failed for ${userId}:`, error)
  })
}
