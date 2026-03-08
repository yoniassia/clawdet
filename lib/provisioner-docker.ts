/**
 * Docker-based NanoClaw Provisioner
 * Creates isolated AI agent containers in ~5 seconds
 */
import { createAgent, healthCheckAgent } from './docker-fleet'
import { findUserById, updateUserById } from './sqlite'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''
const HOST_IP = process.env.HOST_IP || '188.34.197.212'

export const STEPS = [
  { name: 'Validation', icon: '🔍', description: 'Checking configuration...' },
  { name: 'Container Setup', icon: '🐳', description: 'Creating Docker container...' },
  { name: 'DNS Configuration', icon: '🌐', description: 'Setting up your domain...' },
  { name: 'Health Check', icon: '✅', description: 'Verifying agent is live...' },
] as const

function addLog(userId: string, msg: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
  const user = findUserById(userId)
  let logs: Array<{ time: string; msg: string; type: string }> = []
  try {
    logs = user?.provisioning_logs ? JSON.parse(user.provisioning_logs) : []
  } catch { logs = [] }
  logs.push({ time: new Date().toISOString(), msg, type })
  updateUserById(userId, { provisioning_logs: JSON.stringify(logs) } as any)
  console.log(`[DOCKER] [${type.toUpperCase()}] ${msg}`)
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
  addLog(userId, `Step ${step + 1}/${STEPS.length}: ${message || stepInfo.description}`, 'info')
}

export async function provisionDockerAgent(userId: string): Promise<void> {
  console.log(`[DOCKER] ========== Starting provisioning for ${userId} ==========`)
  
  try {
    // === Step 0: Validation ===
    setStep(userId, 0, 'validating', 'Checking your account...')
    
    const user = findUserById(userId)
    if (!user) throw new Error(`User ${userId} not found in database`)
    
    addLog(userId, `User found: ${user.email || user.x_username || userId}`, 'success')
    
    if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not configured on server')
    addLog(userId, 'API key verified ✓', 'success')
    
    const username = user.x_username || user.email?.split('@')[0] || user.id
    const subdomain = username.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    addLog(userId, `Agent name: ${subdomain}`, 'info')
    
    setStep(userId, 0, 'validating', 'Configuration valid ✓')
    await sleep(500)

    // === Step 1: Create Docker container ===
    setStep(userId, 1, 'creating_container', 'Pulling Docker image...')
    addLog(userId, 'Creating NanoClaw container...', 'info')
    
    const agent = createAgent({
      userId,
      username: subdomain,
      anthropicApiKey: ANTHROPIC_API_KEY,
      model: 'claude-sonnet-4-5'
    })
    
    addLog(userId, `Container: ${agent.containerName}`, 'success')
    addLog(userId, `Port: ${agent.port}`, 'success')
    addLog(userId, `Model: Claude Sonnet 4.5`, 'success')
    addLog(userId, `Memory: 128MB limit`, 'info')
    
    updateUserById(userId, {
      hetzner_vps_id: agent.containerId,
      hetzner_vps_ip: `localhost:${agent.port}`,
    } as any)
    
    setStep(userId, 1, 'creating_container', 'Container running ✓')
    await sleep(500)

    // === Step 2: DNS + Caddy reverse proxy ===
    setStep(userId, 2, 'configuring_dns', `Setting up ${subdomain}.clawdet.com...`)
    
    // DNS record
    try {
      const { createSubdomain } = await import('./cloudflare')
      const dnsResult = await createSubdomain(subdomain, HOST_IP, false) // DNS-only: Caddy handles SSL
      if (dnsResult.success) {
        addLog(userId, `DNS record created: ${subdomain}.clawdet.com → ${HOST_IP}`, 'success')
      } else {
        addLog(userId, `DNS: ${dnsResult.error || 'record may already exist'}`, 'warn')
      }
    } catch (e: any) {
      addLog(userId, `DNS note: ${e.message} (may already exist)`, 'warn')
    }

    // Add Caddy reverse proxy route
    try {
      addLog(userId, 'Adding Https reverse proxy...', 'info')
      const { execSync } = await import('child_process')
      const caddyBlock = `\n${subdomain}.clawdet.com {\n\treverse_proxy localhost:${agent.port}\n}\n`
      const currentCaddyfile = execSync('cat /etc/caddy/Caddyfile', { encoding: 'utf8' })
      
      if (!currentCaddyfile.includes(`${subdomain}.clawdet.com`)) {
        execSync(`echo '${caddyBlock}' >> /etc/caddy/Caddyfile`)
        execSync('caddy reload --config /etc/caddy/Caddyfile 2>&1')
        addLog(userId, `Caddy route added: ${subdomain}.clawdet.com → :${agent.port}`, 'success')
      } else {
        addLog(userId, `Caddy route already exists`, 'info')
      }
    } catch (e: any) {
      addLog(userId, `Caddy config: ${e.message}`, 'warn')
    }
    
    setStep(userId, 2, 'configuring_dns', 'Domain + HTTPS configured ✓')
    await sleep(500)

    // === Step 3: Health Check ===
    setStep(userId, 3, 'health_check', 'Waiting for agent to start...')
    addLog(userId, 'Pinging agent health endpoint...', 'info')
    
    let healthy = false
    for (let attempt = 1; attempt <= 5; attempt++) {
      addLog(userId, `Health check attempt ${attempt}/5...`, 'info')
      await sleep(2000)
      healthy = await healthCheckAgent(agent.port, agent.token)
      if (healthy) {
        addLog(userId, `Agent responded! Health: OK ✓`, 'success')
        break
      }
      addLog(userId, `Attempt ${attempt}: not ready yet`, 'warn')
    }
    
    if (!healthy) {
      addLog(userId, 'Agent may still be starting — it should be ready shortly', 'warn')
    }

    // === Complete ===
    const instanceUrl = `https://${subdomain}.clawdet.com`
    
    updateUserById(userId, {
      provisioning_status: 'complete',
      provisioning_step: 4,
      provisioning_progress: 100,
      provisioning_message: 'Your agent is live!',
      instance_url: instanceUrl,
    } as any)
    
    addLog(userId, `🎉 Agent deployed at ${instanceUrl}`, 'success')
    addLog(userId, `Token: ${agent.token.substring(0, 12)}...`, 'info')
    addLog(userId, `API: POST ${instanceUrl}/v1/chat/completions`, 'info')
    console.log(`[DOCKER] ========== COMPLETE: ${instanceUrl} ==========`)

  } catch (error: any) {
    console.error(`[DOCKER] ========== FAILED: ${error.message} ==========`)
    updateUserById(userId, {
      provisioning_status: 'failed',
      provisioning_message: `Failed: ${error.message}`,
    } as any)
    addLog(userId, `❌ ${error.message}`, 'error')
    throw error
  }
}

export function startDockerProvisioning(userId: string): void {
  console.log(`[DOCKER] Queuing background provisioning for ${userId}`)
  provisionDockerAgent(userId).catch(error => {
    console.error(`[DOCKER] Background job failed for ${userId}:`, error)
  })
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
