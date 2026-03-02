/**
 * Instance Health Monitoring
 * 
 * Uses OpenClaw's built-in /healthz endpoint for liveness checks.
 * For the admin dashboard, see also lib/instance-health.ts.
 */

export { checkAllInstances, getProvisionedInstances } from './instance-health'
export type { InstanceHealth, HealthReport } from './instance-health'

/**
 * Check a single instance's /healthz endpoint
 */
export async function checkInstanceHealth(subdomain: string): Promise<{
  healthy: boolean
  responseTimeMs: number
  error?: string
  version?: string
}> {
  const start = Date.now()
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(`https://${subdomain}/healthz`, {
      signal: controller.signal,
    })
    clearTimeout(timeout)

    const responseTimeMs = Date.now() - start

    if (!res.ok) {
      return { healthy: false, responseTimeMs, error: `HTTP ${res.status}` }
    }

    const data = await res.json().catch(() => ({}))
    return {
      healthy: data.ok === true || res.ok,
      responseTimeMs,
      version: data.version,
    }
  } catch (err) {
    return {
      healthy: false,
      responseTimeMs: Date.now() - start,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}
