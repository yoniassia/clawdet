/**
 * Docker-based provisioning for Clawdet customers
 * Uses pre-built coollabsio/openclaw images for fast deployment
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface ProvisioningConfig {
  customerId: string
  apiKey: string
  subdomain: string
  gatewayToken: string
  plan: 'free' | 'pro' | 'enterprise'
  vpsIp: string
  sshKey?: string
}

export interface ProvisioningResult {
  success: boolean
  deployTime: number // milliseconds
  accessUrl: string
  error?: string
  logs?: string
}

/**
 * Provision a new customer instance using Docker
 * ~2-3 minutes (vs 5-10 min building from source)
 */
export async function provisionDockerInstance(
  config: ProvisioningConfig
): Promise<ProvisioningResult> {
  const startTime = Date.now()
  
  try {
    // 1. Upload provision script to VPS
    await uploadProvisionScript(config.vpsIp, config.sshKey)
    
    // 2. Run provision script via SSH
    const result = await runProvisionScript(config)
    
    const deployTime = Date.now() - startTime
    
    if (result.success) {
      return {
        success: true,
        deployTime,
        accessUrl: `https://${config.subdomain}`,
      }
    } else {
      return {
        success: false,
        deployTime,
        accessUrl: `https://${config.subdomain}`,
        error: result.error,
        logs: result.logs,
      }
    }
  } catch (error) {
    return {
      success: false,
      deployTime: Date.now() - startTime,
      accessUrl: `https://${config.subdomain}`,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Upload provision.sh script to VPS
 */
async function uploadProvisionScript(vpsIp: string, sshKey?: string): Promise<void> {
  const sshOpts = sshKey ? `-i ${sshKey}` : ''
  const scriptPath = '/root/.openclaw/workspace/clawdet/scripts/provision.sh'
  
  await execAsync(
    `scp ${sshOpts} -o StrictHostKeyChecking=no ${scriptPath} root@${vpsIp}:/tmp/provision.sh`
  )
  
  await execAsync(
    `ssh ${sshOpts} -o StrictHostKeyChecking=no root@${vpsIp} "chmod +x /tmp/provision.sh"`
  )
}

/**
 * Run provision script on VPS
 */
async function runProvisionScript(
  config: ProvisioningConfig
): Promise<{ success: boolean; error?: string; logs?: string }> {
  const sshOpts = config.sshKey ? `-i ${config.sshKey}` : ''
  
  const command = `ssh ${sshOpts} -o StrictHostKeyChecking=no root@${config.vpsIp} "
    /tmp/provision.sh \\
      --customer-id ${config.customerId} \\
      --api-key '${config.apiKey}' \\
      --subdomain ${config.subdomain} \\
      --gateway-token '${config.gatewayToken}' \\
      --plan ${config.plan}
  "`
  
  try {
    const { stdout, stderr } = await execAsync(command, { timeout: 600000 }) // 10 min timeout
    
    // Check if "Deployment Successful" appears in output
    if (stdout.includes('Deployment Successful') || stdout.includes('OpenClaw is healthy')) {
      return { success: true }
    } else {
      return {
        success: false,
        error: 'Health check did not pass',
        logs: stdout + '\n' + stderr,
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'SSH command failed',
      logs: error instanceof Error && 'stdout' in error ? String(error.stdout) : undefined,
    }
  }
}

/**
 * Check if an instance is healthy
 */
export async function checkInstanceHealth(subdomain: string): Promise<boolean> {
  try {
    const response = await fetch(`https://${subdomain}/healthz`, {
      signal: AbortSignal.timeout(5000),
    })
    const data = await response.json()
    return data.ok === true
  } catch {
    return false
  }
}

/**
 * Restart an instance (via Docker Compose)
 */
export async function restartInstance(vpsIp: string, sshKey?: string): Promise<boolean> {
  const sshOpts = sshKey ? `-i ${sshKey}` : ''
  
  try {
    await execAsync(
      `ssh ${sshOpts} -o StrictHostKeyChecking=no root@${vpsIp} "cd /opt/clawdet && docker compose restart"`
    )
    return true
  } catch {
    return false
  }
}

/**
 * Get instance logs
 */
export async function getInstanceLogs(
  vpsIp: string,
  lines: number = 100,
  sshKey?: string
): Promise<string> {
  const sshOpts = sshKey ? `-i ${sshKey}` : ''
  
  try {
    const { stdout } = await execAsync(
      `ssh ${sshOpts} -o StrictHostKeyChecking=no root@${vpsIp} "cd /opt/clawdet && docker compose logs --tail=${lines}"`
    )
    return stdout
  } catch (error) {
    return `Error fetching logs: ${error instanceof Error ? error.message : 'Unknown'}`
  }
}
