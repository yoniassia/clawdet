#!/usr/bin/env node
/**
 * Daily health check for all customer instances
 * Auto-restarts unhealthy instances
 */

const fs = require('fs')
const path = require('path')

const STATE_FILE = path.join(__dirname, '../../data/docker-manager-state.json')

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
}

function log(color, message) {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`)
}

async function checkInstanceHealth(subdomain) {
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
        error: `HTTP ${response.status}`,
        timestamp: new Date().toISOString(),
      }
    }
    
    const data = await response.json()
    
    return {
      healthy: data.ok === true,
      version: data.version,
      uptime: data.uptime,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }
  }
}

async function loadState() {
  try {
    const data = fs.readFileSync(STATE_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    // First run or file doesn't exist
    return {
      lastHealthCheck: null,
      instances: {},
    }
  }
}

function saveState(state) {
  const dir = path.dirname(STATE_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2))
}

async function getActiveInstances() {
  // TODO: Query database for active instances
  // For now, return example
  
  // This should be replaced with actual database query:
  // const db = require('../../lib/db')
  // const result = await db.query(`
  //   SELECT customer_id, subdomain, vps_ip, plan
  //   FROM instances
  //   WHERE status = 'active'
  // `)
  // return result.rows
  
  // Example for testing:
  return [
    // { customerId: 'test1', subdomain: 'test1.clawdet.com', vpsIp: '1.2.3.4', plan: 'pro' },
  ]
}

async function runHealthChecks() {
  log('blue', '\n═══════════════════════════════════════════')
  log('blue', '  Docker Instance Health Check')
  log('blue', '═══════════════════════════════════════════\n')
  
  const state = await loadState()
  const instances = await getActiveInstances()
  
  if (instances.length === 0) {
    log('yellow', 'No active instances found')
    log('yellow', 'Note: Database query needs to be implemented in getActiveInstances()')
    return
  }
  
  log('blue', `Checking ${instances.length} instance(s)...\n`)
  
  let healthy = 0
  let unhealthy = 0
  
  for (const instance of instances) {
    const status = await checkInstanceHealth(instance.subdomain)
    
    // Initialize instance state if not exists
    if (!state.instances[instance.customerId]) {
      state.instances[instance.customerId] = {
        lastHealthy: null,
        consecutiveFailures: 0,
        lastRestart: null,
        version: null,
      }
    }
    
    const instanceState = state.instances[instance.customerId]
    
    if (status.healthy) {
      log('green', `✓ ${instance.customerId} (${instance.subdomain}) - healthy`)
      log('green', `  Version: ${status.version || 'unknown'}`)
      
      // Update state
      instanceState.lastHealthy = status.timestamp
      instanceState.consecutiveFailures = 0
      instanceState.version = status.version
      
      healthy++
    } else {
      log('red', `✗ ${instance.customerId} (${instance.subdomain}) - unhealthy`)
      log('red', `  Error: ${status.error}`)
      
      // Update state
      instanceState.consecutiveFailures++
      
      unhealthy++
      
      // Auto-restart after 3 consecutive failures
      if (instanceState.consecutiveFailures >= 3) {
        log('yellow', `  Attempting restart (${instanceState.consecutiveFailures} failures)...`)
        
        // TODO: Implement restart via SSH + docker compose restart
        // const { restartInstance } = require('../../lib/docker-provisioning')
        // const restarted = await restartInstance(instance.vpsIp, instance.sshKey)
        
        // For now, just log
        log('yellow', '  (Restart not implemented - needs SSH access)')
        
        instanceState.lastRestart = new Date().toISOString()
      }
    }
  }
  
  // Save state
  state.lastHealthCheck = new Date().toISOString()
  saveState(state)
  
  // Summary
  log('blue', '\n═══════════════════════════════════════════')
  log('green', `Summary: ${healthy} healthy, ${unhealthy} unhealthy`)
  log('blue', '═══════════════════════════════════════════\n')
  
  // Alert if too many unhealthy
  if (unhealthy > 0 && instances.length > 0) {
    const unhealthyPercent = (unhealthy / instances.length) * 100
    if (unhealthyPercent > 20) {
      log('red', `⚠️  ALERT: ${unhealthyPercent.toFixed(1)}% of instances are unhealthy!`)
    }
  }
}

// Run health checks
runHealthChecks().catch((error) => {
  log('red', `Health check failed: ${error.message}`)
  process.exit(1)
})
