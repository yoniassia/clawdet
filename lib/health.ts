/**
 * Health monitoring for customer instances
 * Uses /healthz endpoint + auto-restart on failures
 */

import { restartInstance } from './docker-provisioning'

export interface HealthStatus {
  healthy: boolean
  timestamp: Date
  responseTime?: number
  error?: string
  gatewayVersion?: string
  uptime?: number
}

export interface InstanceInfo {
  customerId: string
  subdomain: string
  vpsIp: string
  plan: string
  sshKey?: string
}

/**
 * Check health of a single instance
 */
export async function checkInstanceHealth(subdomain: string): Promise<HealthStatus> {
  const startTime = Date.now()
  
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(`https://${subdomain}/healthz`, {
      signal: controller.signal,
    })
    
    clearTimeout(timeout)
    
    if (!response.ok) {
      return {
        healthy: false,
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
        error: `HTTP ${response.status}`,
      }
    }
    
    const data = await response.json()
    
    return {
      healthy: data.ok === true,
      timestamp: new Date(),
      responseTime: Date.now() - startTime,
      gatewayVersion: data.version,
      uptime: data.uptime,
    }
  } catch (error) {
    return {
      healthy: false,
      timestamp: new Date(),
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Check health of multiple instances in parallel
 */
export async function checkMultipleInstances(
  instances: InstanceInfo[]
): Promise<Map<string, HealthStatus>> {
  const results = new Map<string, HealthStatus>()
  
  const checks = instances.map(async (instance) => {
    const status = await checkInstanceHealth(instance.subdomain)
    results.set(instance.customerId, status)
  })
  
  await Promise.all(checks)
  
  return results
}

/**
 * Monitor instance health and auto-restart if unhealthy
 */
export async function monitorAndRestart(
  instance: InstanceInfo,
  maxRetries: number = 3
): Promise<{ restarted: boolean; attempts: number }> {
  let attempts = 0
  
  while (attempts < maxRetries) {
    const status = await checkInstanceHealth(instance.subdomain)
    
    if (status.healthy) {
      return { restarted: false, attempts }
    }
    
    // Unhealthy - try restart
    console.log(`[Health] Instance ${instance.customerId} unhealthy, restarting (attempt ${attempts + 1}/${maxRetries})`)
    
    const restarted = await restartInstance(instance.vpsIp, instance.sshKey)
    
    if (!restarted) {
      console.error(`[Health] Failed to restart instance ${instance.customerId}`)
      break
    }
    
    // Wait for container to start
    await sleep(30000) // 30 seconds
    
    // Check again
    const recheckStatus = await checkInstanceHealth(instance.subdomain)
    
    if (recheckStatus.healthy) {
      console.log(`[Health] Instance ${instance.customerId} recovered after restart`)
      return { restarted: true, attempts: attempts + 1 }
    }
    
    attempts++
  }
  
  console.error(`[Health] Instance ${instance.customerId} failed to recover after ${attempts} attempts`)
  return { restarted: true, attempts }
}

/**
 * Run health checks on all instances and restart unhealthy ones
 */
export async function healthCheckCron(instances: InstanceInfo[]): Promise<{
  total: number
  healthy: number
  unhealthy: number
  restarted: number
}> {
  console.log(`[Health] Checking ${instances.length} instances...`)
  
  let healthy = 0
  let unhealthy = 0
  let restarted = 0
  
  for (const instance of instances) {
    const status = await checkInstanceHealth(instance.subdomain)
    
    if (status.healthy) {
      healthy++
    } else {
      unhealthy++
      console.log(`[Health] Instance ${instance.customerId} unhealthy: ${status.error}`)
      
      // Try to restart
      const result = await monitorAndRestart(instance, 2)
      if (result.restarted) {
        restarted++
      }
    }
  }
  
  console.log(`[Health] Results: ${healthy} healthy, ${unhealthy} unhealthy, ${restarted} restarted`)
  
  return {
    total: instances.length,
    healthy,
    unhealthy,
    restarted,
  }
}

/**
 * Get health history for an instance (from database)
 */
export interface HealthHistoryEntry {
  timestamp: Date
  healthy: boolean
  responseTime: number
  error?: string
}

/**
 * Track health status in database
 */
export async function recordHealthStatus(
  customerId: string,
  status: HealthStatus,
  db: any // PostgreSQL client
): Promise<void> {
  await db.query(
    `INSERT INTO instance_health (customer_id, healthy, response_time, error, checked_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [customerId, status.healthy, status.responseTime, status.error, status.timestamp]
  )
}

/**
 * Get recent health history
 */
export async function getHealthHistory(
  customerId: string,
  limit: number = 100,
  db: any
): Promise<HealthHistoryEntry[]> {
  const result = await db.query(
    `SELECT checked_at as timestamp, healthy, response_time, error
     FROM instance_health
     WHERE customer_id = $1
     ORDER BY checked_at DESC
     LIMIT $2`,
    [customerId, limit]
  )
  
  return result.rows
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
