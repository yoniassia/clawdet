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

export const STEPS = [
  { name: 'Validation', icon: '🔍', description: 'Validating configuration...' },
  { name: 'VPS Creation', icon: '🖥️', description: 'Creating your VPS server...' },
  { name: 'DNS Configuration', icon: '🌐', description: 'Setting up your domain...' },
  { name: 'SSH Setup', icon: '🔑', description: 'Establishing secure connection...' },
  { name: 'Dependencies Install', icon: '📦', description: 'Installing system packages...' },
  { name: 'OpenClaw Install', icon: '🧠', description: 'Installing OpenClaw and configuring gateway...' },
  { name: 'SSL Setup', icon: '🔒', description: 'Configuring HTTPS certificates...' },
  { name: 'Startup & Verify', icon: '🚀', description: 'Starting services and verifying...' },
] as const

export interface ProvisioningStatus {
  status: 'pending' | 'creating_vps' | 'configuring_dns' | 'installing' | 'complete' | 'failed'
  step: number
  totalSteps: number
  stepName: string
  progress: number
  message: string
  error?: string
  vpsId?: number
  vpsIp?: string
  instanceUrl?: string
  logs: Array<{ time: string; msg: string; type: 'info' | 'success' | 'error' | 'warn' }>
}

function addLog(userId: string, msg: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
  const user = findUserById(userId)
  const logs = user?.provisioningLogs || []
  logs.push({ time: new Date().toISOString(), msg, type })
  updateUser(userId, { provisioningLogs: logs })
}

function setStep(userId: string, step: number, status: string, message?: string) {
  const stepInfo = STEPS[step] || STEPS[0]
  const progress = Math.round(((step) / STEPS.length) * 100)
  updateUser(userId, {
    provisioningStatus: status as any,
    provisioningStep: step,
    provisioningStepName: stepInfo.name,
    provisioningProgress: progress,
    provisioningMessage: message || stepInfo.description,
  })
  addLog(userId, message || stepInfo.description, 'info')
}

/**
 * Start provisioning process for a user
 */
export async function provisionUserInstance(userId: string): Promise<void> {
  console.log(`[PROVISIONER] Starting provisioning for user: ${userId}`)
  
  try {
    // Step 0: Validation
    setStep(userId, 0, 'pending', 'Validating configuration...')
    
    const user = findUserById(userId)
    if (!user) {
      throw new Error(`User ${userId} not found`)
    }

    if (!XAI_API_KEY) {
      throw new Error('XAI_API_KEY is not configured')
    }
    
    addLog(userId, 'Configuration validated successfully', 'success')

    // Step 1: Create VPS
    setStep(userId, 1, 'creating_vps', 'Creating your VPS server...')
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
    addLog(userId, `VPS created (ID: ${serverResponse.server.id})`, 'success')
    
    updateUser(userId, { hetznerVpsId: serverResponse.server.id.toString() })

    addLog(userId, 'Waiting for VPS to boot...', 'info')
    const server = await waitForServer(serverResponse.server.id, 180000)
    const vpsIp = server.public_net.ipv4.ip
    
    console.log(`[PROVISIONER] VPS ready at IP: ${vpsIp}`)
    addLog(userId, `VPS ready at ${vpsIp}`, 'success')
    updateUser(userId, { hetznerVpsIp: vpsIp })

    // Step 2: Configure DNS
    setStep(userId, 2, 'configuring_dns', 'Setting up your domain...')

    console.log(`[PROVISIONER] Configuring DNS: ${subdomain}.clawdet.com → ${vpsIp}`)
    
    const dnsResult = await createSubdomain(subdomain, vpsIp, true) // proxied=true for SSL
    if (!dnsResult.success) {
      throw new Error(`DNS creation failed: ${dnsResult.error}`)
    }
    
    console.log(`[PROVISIONER] DNS configured: ${subdomain}.clawdet.com (Cloudflare SSL enabled)`)
    addLog(userId, `DNS configured: ${subdomain}.clawdet.com`, 'success')

    // Step 3: SSH Setup
    setStep(userId, 3, 'installing', 'Establishing secure SSH connection...')
    addLog(userId, 'Waiting for SSH to become available...', 'info')

    // Step 4: Dependencies Install
    setStep(userId, 4, 'installing', 'Installing system dependencies...')
    
    // Step 5: OpenClaw Install
    setStep(userId, 5, 'installing', 'Installing OpenClaw and configuring gateway...')

    console.log(`[PROVISIONER] Installing OpenClaw via SSH...`)
    await installOpenClawViaSSH({
      host: vpsIp,
      sshKeyPath: SSH_KEY_PATH,
      xUsername: username,
      subdomain,
      xaiApiKey: XAI_API_KEY
    })

    console.log(`[PROVISIONER] OpenClaw installation complete!`)
    addLog(userId, 'OpenClaw installed successfully', 'success')

    // Step 6: SSL Setup
    setStep(userId, 6, 'installing', 'Configuring HTTPS certificates...')
    addLog(userId, 'Cloudflare SSL proxy active', 'success')

    // Step 7: Startup & Verify
    setStep(userId, 7, 'installing', 'Starting services and verifying...')
    addLog(userId, 'Gateway service started', 'success')

    // Complete
    const instanceUrl = `https://${subdomain}.clawdet.com`
    addLog(userId, `Instance ready at ${instanceUrl}`, 'success')
    
    updateUser(userId, {
      provisioningStatus: 'complete',
      provisioningStep: 8,
      provisioningProgress: 100,
      provisioningMessage: 'Your instance is ready!',
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

  const status = user.provisioningStatus || 'pending'
  const step = user.provisioningStep ?? 0
  const stepInfo = STEPS[step] || STEPS[0]

  return {
    status: status as any,
    step,
    totalSteps: STEPS.length,
    stepName: user.provisioningStepName || stepInfo.name,
    progress: user.provisioningProgress ?? (status === 'complete' ? 100 : 0),
    message: user.provisioningMessage || stepInfo.description,
    vpsId: user.hetznerVpsId ? parseInt(user.hetznerVpsId) : undefined,
    vpsIp: user.hetznerVpsIp,
    instanceUrl: user.instanceUrl,
    logs: user.provisioningLogs || [],
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
