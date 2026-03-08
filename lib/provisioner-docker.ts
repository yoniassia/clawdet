/**
 * Docker-based Provisioner
 * Replaces VPS provisioning — each user gets a NanoClaw Docker container
 */
import { createAgent, getAgentStatus, healthCheckAgent } from './docker-fleet'
import { findUserById, updateUserById } from './sqlite'
import { createSubdomain } from './cloudflare'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''
const HOST_IP = process.env.HOST_IP || '188.34.197.212'

export const STEPS = [
  { name: 'Validation', icon: '🔍', description: 'Validating configuration...' },
  { name: 'Container Setup', icon: '🐳', description: 'Creating your AI container...' },
  { name: 'DNS Configuration', icon: '🌐', description: 'Setting up your domain...' },
  { name: 'Health Check', icon: '✅', description: 'Verifying your agent is live...' },
] as const

function addLog(userId: string, msg: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
  const user = findUserById(userId)
  let logs: Array<{ time: string; msg: string; type: string }> = []
  try {
    logs = user?.provisioning_logs ? JSON.parse(user.provisioning_logs) : []
  } catch { logs = [] }
  logs.push({ time: new Date().toISOString(), msg, type })
  updateUserById(userId, { provisioning_logs: JSON.stringify(logs) } as any)
}

function setStep(userId: string, step: number, status: string, message?: string) {
  const stepInfo = STEPS[step] || STEPS[0]
  const progress = Math.round(((step) / STEPS.length) * 100)
  updateUserById(userId, {
    provisioning_status: status,
    provisioning_step: step,
    provisioning_step_name: stepInfo.name,
    provisioning_progress: progress,
    provisioning_message: message || stepInfo.description,
  } as any)
  addLog(userId, message || stepInfo.description, 'info')
}

/**
 * Provision a Docker-based NanoClaw agent for a user
 */
export async function provisionDockerAgent(userId: string): Promise<void> {
  console.log(`[DOCKER-PROVISIONER] Starting for user: ${userId}`)
  
  try {
    // Step 0: Validation
    setStep(userId, 0, 'pending', 'Validating configuration...')
    
    const user = findUserById(userId)
    if (!user) throw new Error(`User ${userId} not found`)
    if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not configured')
    
    const username = user.x_username || user.email?.split('@')[0] || user.id
    const subdomain = username.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    
    addLog(userId, `Provisioning agent for ${username}`, 'success')

    // Step 1: Create Docker container
    setStep(userId, 1, 'creating_vps', 'Creating your AI container...')
    
    const agent = createAgent({
      userId,
      username: subdomain,
      anthropicApiKey: ANTHROPIC_API_KEY,
      model: 'claude-sonnet-4-5'
    })
    
    console.log(`[DOCKER-PROVISIONER] Container created: ${agent.containerName} on port ${agent.port}`)
    addLog(userId, `Container ${agent.containerName} started on port ${agent.port}`, 'success')
    
    // Save container info to user record  
    updateUserById(userId, {
      hetzner_vps_id: agent.containerId, // Reuse field for container ID
      hetzner_vps_ip: `localhost:${agent.port}`, // Reuse field for endpoint
    } as any)

    // Step 2: DNS (point subdomain to main server)
    setStep(userId, 2, 'configuring_dns', 'Setting up your domain...')
    
    try {
      const dnsResult = await createSubdomain(subdomain, HOST_IP, true)
      if (dnsResult.success) {
        addLog(userId, `DNS configured: ${subdomain}.clawdet.com`, 'success')
      } else {
        addLog(userId, `DNS warning: ${dnsResult.error} (may already exist)`, 'warn')
      }
    } catch (e: any) {
      addLog(userId, `DNS note: ${e.message}`, 'warn')
    }

    // Step 3: Health check
    setStep(userId, 3, 'installing', 'Verifying your agent is live...')
    
    // Wait a moment for container to fully start
    await new Promise(r => setTimeout(r, 3000))
    
    const healthy = await healthCheckAgent(agent.port, agent.token)
    if (healthy) {
      addLog(userId, 'Agent health check passed ✅', 'success')
    } else {
      addLog(userId, 'Agent may still be starting up', 'warn')
    }

    // Complete
    const instanceUrl = `https://${subdomain}.clawdet.com`
    
    updateUserById(userId, {
      provisioning_status: 'complete',
      provisioning_step: 4,
      provisioning_progress: 100,
      provisioning_message: 'Your agent is ready!',
      instance_url: instanceUrl,
    } as any)
    
    addLog(userId, `🎉 Agent ready at ${instanceUrl}`, 'success')
    console.log(`[DOCKER-PROVISIONER] ✅ Complete! ${instanceUrl}`)

  } catch (error: any) {
    console.error(`[DOCKER-PROVISIONER] ❌ Failed:`, error)
    updateUserById(userId, { provisioning_status: 'failed' } as any)
    addLog(userId, `Failed: ${error.message}`, 'error')
    throw error
  }
}

/**
 * Start provisioning in background
 */
export function startDockerProvisioning(userId: string): void {
  provisionDockerAgent(userId).catch(error => {
    console.error(`[DOCKER-PROVISIONER] Background job failed for ${userId}:`, error)
  })
}
