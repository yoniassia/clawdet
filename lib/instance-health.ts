/**
 * Instance Health Monitoring Service
 * Checks health of all provisioned user instances
 */

import { getDb, type DbUser } from './sqlite'

export interface InstanceHealth {
  userId: string
  username: string
  instanceUrl: string
  vpsIp: string | null
  httpStatus: number | null
  gatewayStatus: 'up' | 'down' | 'unknown'
  responseTimeMs: number | null
  checkedAt: string
  error?: string
}

export interface HealthReport {
  checkedAt: string
  totalInstances: number
  healthy: number
  unhealthy: number
  instances: InstanceHealth[]
}

/**
 * Get all provisioned instances from the database
 */
export function getProvisionedInstances(): DbUser[] {
  const db = getDb()
  return db.prepare(
    "SELECT * FROM users WHERE provisioning_status = 'complete' AND instance_url IS NOT NULL"
  ).all() as DbUser[]
}

/**
 * Check health of a single instance
 */
async function checkInstance(user: DbUser): Promise<InstanceHealth> {
  const username = user.username || user.x_username || user.email?.split('@')[0] || user.id
  const result: InstanceHealth = {
    userId: user.id,
    username,
    instanceUrl: user.instance_url!,
    vpsIp: user.hetzner_vps_ip,
    httpStatus: null,
    gatewayStatus: 'unknown',
    responseTimeMs: null,
    checkedAt: new Date().toISOString(),
  }

  try {
    // Check the instance URL (HTTPS via Cloudflare)
    const start = Date.now()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(result.instanceUrl, {
      signal: controller.signal,
      redirect: 'follow',
    })
    clearTimeout(timeout)

    result.responseTimeMs = Date.now() - start
    result.httpStatus = response.status

    // If we can reach the site, try the gateway health endpoint
    if (user.hetzner_vps_ip) {
      try {
        const gwController = new AbortController()
        const gwTimeout = setTimeout(() => gwController.abort(), 5000)
        // Gateway health check via Cloudflare proxy
        const gwUrl = `${result.instanceUrl}/gateway/health`
        const gwResponse = await fetch(gwUrl, {
          signal: gwController.signal,
        }).catch(() => null)
        clearTimeout(gwTimeout)

        if (gwResponse && gwResponse.ok) {
          result.gatewayStatus = 'up'
        } else {
          // Try the /v1/models endpoint as alternative health check
          const modelsController = new AbortController()
          const modelsTimeout = setTimeout(() => modelsController.abort(), 5000)
          const modelsResponse = await fetch(`${result.instanceUrl}/v1/models`, {
            signal: modelsController.signal,
          }).catch(() => null)
          clearTimeout(modelsTimeout)

          result.gatewayStatus = modelsResponse && (modelsResponse.status === 200 || modelsResponse.status === 401) ? 'up' : 'down'
        }
      } catch {
        result.gatewayStatus = 'down'
      }
    }
  } catch (err) {
    result.error = err instanceof Error ? err.message : 'Unknown error'
    result.gatewayStatus = 'down'
  }

  return result
}

/**
 * Check health of all provisioned instances
 */
export async function checkAllInstances(): Promise<HealthReport> {
  const instances = getProvisionedInstances()

  // Check all in parallel (with concurrency limit of 5)
  const results: InstanceHealth[] = []
  const batchSize = 5

  for (let i = 0; i < instances.length; i += batchSize) {
    const batch = instances.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(checkInstance))
    results.push(...batchResults)
  }

  const healthy = results.filter(r => r.httpStatus === 200 && r.gatewayStatus === 'up').length

  return {
    checkedAt: new Date().toISOString(),
    totalInstances: results.length,
    healthy,
    unhealthy: results.length - healthy,
    instances: results,
  }
}
