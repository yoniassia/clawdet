/**
 * Provisioning Service
 * Orchestrates VPS creation, DNS setup, and OpenClaw installation
 */

import { createServer, waitForServer, generateCloudInit, HetznerServer } from '../hetzner'
import { updateUser, findUserById, User } from '../db'
import { installOpenClawViaSSH, testSSHConnection } from './ssh-installer'
import { createSubdomain, waitForDNSPropagation, mockMode as cloudflareMock } from '../cloudflare'

const XAI_API_KEY = process.env.XAI_API_KEY || process.env.GROK_API_KEY
const MOCK_DNS = process.env.CLOUDFLARE_MOCK_MODE === 'true'

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
    const username = user.xUsername || user.email?.split('@')[0] || user.id
    console.log(`[PROVISIONER] Creating VPS for ${username}`)
    const subdomain = username.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    
    const cloudInit = generateCloudInit({
      xaiApiKey: XAI_API_KEY || '',
      username: username,
      subdomain
    })

    const serverResponse = await createServer({
      name: `clawdet-${subdomain}`,
      server_type: 'cx11', // Smallest instance: 1 vCPU, 2GB RAM
      image: 'ubuntu-22.04',
      location: 'fsn1', // Falkenstein, Germany
      labels: {
        'project': 'clawdet',
        'user': username,
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
    
    // Save VPS IP
    updateUser(userId, {
      hetznerVpsIp: vpsIp
    })

    // Step 3: Configure DNS
    updateUser(userId, {
      provisioningStatus: 'configuring_dns'
    })

    console.log(`[PROVISIONER] Configuring DNS: ${subdomain}.clawdet.com → ${vpsIp}`)
    
    if (MOCK_DNS) {
      await cloudflareMock.createSubdomain(subdomain, vpsIp)
    } else {
      const dnsResult = await createSubdomain(subdomain, vpsIp, true) // proxied=true for SSL
      if (!dnsResult.success) {
        throw new Error(`DNS creation failed: ${dnsResult.error}`)
      }
      
      // Wait for DNS propagation (optional - may add delay but ensures DNS is ready)
      console.log(`[PROVISIONER] Waiting for DNS propagation...`)
      await waitForDNSPropagation(`${subdomain}.clawdet.com`, vpsIp)
    }
    
    console.log(`[PROVISIONER] DNS configured: ${subdomain}.clawdet.com`)

    // Step 4: Wait for SSH to be available
    console.log(`[PROVISIONER] Waiting for SSH to be available...`)
    const rootPassword = serverResponse.root_password
    if (!rootPassword) {
      throw new Error('No root password provided by Hetzner')
    }

    // Wait up to 3 minutes for SSH to be ready
    let sshReady = false
    const sshStartTime = Date.now()
    const sshTimeout = 180000 // 3 minutes

    while (!sshReady && Date.now() - sshStartTime < sshTimeout) {
      try {
        sshReady = await testSSHConnection(vpsIp, rootPassword)
        if (sshReady) {
          console.log(`[PROVISIONER] SSH is ready!`)
          break
        }
      } catch (error) {
        // SSH not ready yet, continue waiting
      }
      
      // Wait 10 seconds before trying again
      await new Promise(resolve => setTimeout(resolve, 10000))
    }

    if (!sshReady) {
      throw new Error('SSH connection timeout - VPS did not become accessible')
    }

    // Step 5: Install OpenClaw via SSH
    updateUser(userId, {
      provisioningStatus: 'installing'
    })

    console.log(`[PROVISIONER] Installing OpenClaw via SSH...`)
    await installOpenClawViaSSH({
      host: vpsIp,
      password: rootPassword,
      username: 'root',
      xUsername: username,
      subdomain,
      xaiApiKey: XAI_API_KEY
    })

    console.log(`[PROVISIONER] OpenClaw installation complete!`)

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
 * Generate customer handoff information
 */
export function generateHandoffInfo(user: User): {
  instanceUrl: string;
  username: string;
  setupInstructions: string;
  credentials: string;
} {
  const username = user.xUsername || user.email?.split('@')[0] || user.id
  const subdomain = username.toLowerCase().replace(/[^a-z0-9-]/g, '-')
  const instanceUrl = `https://${subdomain}.clawdet.com`
  
  return {
    instanceUrl,
    username: username,
    setupInstructions: `
🎉 Your OpenClaw instance is ready!

**Access your instance:**
${instanceUrl}

**What's included:**
✅ Private VPS server (2GB RAM, 1 vCPU)
✅ OpenClaw pre-installed and configured
✅ Grok AI (xAI) integration enabled
✅ Secure HTTPS with Cloudflare SSL
✅ Your own subdomain: ${subdomain}.clawdet.com

**Getting Started:**
1. Your OpenClaw Gateway is running at ${instanceUrl}:18789
2. Connect via Telegram by configuring your bot token
3. All workspace files are in ~/.openclaw/workspace
4. Check logs: journalctl -u openclaw-gateway -f

**Need help?**
- Documentation: https://clawdet.com/docs
- Support: support@clawdet.com
- Twitter: @clawdet

Welcome to OpenClaw! 🦞
    `.trim(),
    credentials: `
Server IP: ${user.hetznerVpsIp}
SSH Access: Contact support for root credentials
Instance URL: ${instanceUrl}
    `.trim()
  }
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
