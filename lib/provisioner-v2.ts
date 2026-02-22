/**
 * Provisioning Service V2
 * Production-ready orchestration: VPS → DNS → SSL → OpenClaw
 */

import { createServer, waitForServer, HetznerServer } from './hetzner'
import { updateUser, findUserById, User } from './db'
import { installOpenClawViaSSH, testSSHConnection } from './ssh-installer-v2'
import { createSubdomain, waitForDNSPropagation } from './cloudflare'

const XAI_API_KEY = process.env.XAI_API_KEY || process.env.GROK_API_KEY
const SSH_KEY_PATH = process.env.SSH_KEY_PATH || '/root/.ssh/id_ed25519'
const HETZNER_SSH_KEY_ID = 107615133 // clawdet-provisioning key

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

    if (!XAI_API_KEY) {
      throw new Error('XAI_API_KEY is not configured')
    }

    // Update status: creating VPS
    updateUser(userId, {
      provisioningStatus: 'creating_vps'
    })

    // Step 1: Create VPS
    const username = user.xUsername || user.email?.split('@')[0] || user.id
    console.log(`[PROVISIONER] Creating VPS for ${username}`)
    const subdomain = username.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    
    const serverResponse = await createServer({
      name: `clawdet-${subdomain}`,
      server_type: 'cax11', // ARM 2 vCPU, 4GB RAM, 40GB SSD (cx22/cx23 deprecated)
      image: 'ubuntu-24.04',
      location: 'hel1', // Helsinki, Finland
      ssh_keys: [HETZNER_SSH_KEY_ID],
      labels: {
        'project': 'clawdet',
        'user': username,
        'user_id': userId
      }
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

    // Step 3: Configure DNS with Cloudflare SSL proxy
    updateUser(userId, {
      provisioningStatus: 'configuring_dns'
    })

    console.log(`[PROVISIONER] Configuring DNS: ${subdomain}.clawdet.com → ${vpsIp}`)
    
    const dnsResult = await createSubdomain(subdomain, vpsIp, true) // proxied=true for SSL
    if (!dnsResult.success) {
      throw new Error(`DNS creation failed: ${dnsResult.error}`)
    }
    
    console.log(`[PROVISIONER] DNS configured: ${subdomain}.clawdet.com (Cloudflare SSL enabled)`)

    // Optional: Wait for DNS propagation (can skip to save time)
    // await waitForDNSPropagation(`${subdomain}.clawdet.com`, vpsIp, 60000)

    // Step 4: Wait for SSH to be available and install OpenClaw
    updateUser(userId, {
      provisioningStatus: 'installing'
    })

    console.log(`[PROVISIONER] Installing OpenClaw via SSH...`)
    await installOpenClawViaSSH({
      host: vpsIp,
      sshKeyPath: SSH_KEY_PATH,
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
✅ Private VPS server (4GB RAM, 2 vCPU)
✅ OpenClaw pre-installed and configured
✅ Grok AI (xAI) integration enabled
✅ Secure HTTPS with Cloudflare SSL
✅ Your own subdomain: ${subdomain}.clawdet.com

**Getting Started:**
1. Visit ${instanceUrl} to access your OpenClaw web interface
2. Your Gateway is running at port 18789
3. Connect via Telegram by configuring your bot token
4. All workspace files are in ~/.openclaw/workspace

**Quick Commands:**
\`\`\`bash
# Check service status
systemctl status openclaw-gateway

# View logs
journalctl -u openclaw-gateway -f

# Restart service
systemctl restart openclaw-gateway
\`\`\`

**Need help?**
- Documentation: https://clawdet.com/docs
- FAQ: https://clawdet.com/faq
- Support: support@clawdet.com
- Twitter: @clawdet

Welcome to OpenClaw! 🦞
    `.trim(),
    credentials: `
Server IP: ${user.hetznerVpsIp}
SSH Access: Contact support for SSH credentials
Instance URL: ${instanceUrl}
Gateway Port: 18789
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
    'configuring_dns': { progress: 50, message: 'Setting up your domain and SSL...' },
    'installing': { progress: 75, message: 'Installing OpenClaw (2-3 minutes)...' },
    'complete': { progress: 100, message: 'Your instance is ready!' },
    'failed': { progress: 0, message: 'Provisioning failed. Please contact support.' }
  }

  const status = user.provisioningStatus || 'pending'
  const info = statusMap[status] || statusMap['pending']

  return {
    status: status as any,
    progress: info.progress,
    message: info.message,
    vpsId: user.hetznerVpsId ? parseInt(user.hetznerVpsId) : undefined,
    vpsIp: user.hetznerVpsIp,
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
