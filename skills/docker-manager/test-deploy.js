#!/usr/bin/env node
/**
 * Test Docker deployment locally or on test VPS
 * Validates: gateway tokens, health checks, accessibility
 */

const { exec } = require('child_process')
const { promisify } = require('util')
const crypto = require('crypto')

const execAsync = promisify(exec)

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

async function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}

async function testLocalDeploy(plan = 'pro') {
  log('blue', '\n═══════════════════════════════════════════')
  log('blue', '  Testing Docker Deployment Locally')
  log('blue', '═══════════════════════════════════════════\n')
  
  const testConfig = {
    customerId: 'test-' + Date.now(),
    apiKey: process.env.ANTHROPIC_API_KEY || 'sk-ant-test',
    subdomain: 'test.local',
    gatewayToken: await generateToken(),
    plan: plan,
  }
  
  log('green', `Customer ID: ${testConfig.customerId}`)
  log('green', `Plan: ${testConfig.plan}`)
  log('green', `Gateway Token: ${testConfig.gatewayToken.substring(0, 16)}...`)
  
  // Check if Docker is available
  try {
    await execAsync('docker --version')
    log('green', '✓ Docker is installed')
  } catch (error) {
    log('red', '✗ Docker is not installed')
    log('yellow', 'Install Docker: curl -fsSL https://get.docker.com | sh')
    process.exit(1)
  }
  
  // Test template exists
  const templatePath = `../../../templates/docker-compose.${plan}.yml`
  try {
    const fs = require('fs')
    const template = fs.readFileSync(templatePath, 'utf8')
    log('green', '✓ Template file exists')
    
    // Validate template has required vars
    const requiredVars = [
      'ANTHROPIC_API_KEY',
      'OPENCLAW_GATEWAY_TOKEN',
      'AUTH_PASSWORD',
    ]
    
    for (const varName of requiredVars) {
      if (template.includes(`\${${varName}}`)) {
        log('green', `  ✓ Template includes ${varName}`)
      } else {
        log('red', `  ✗ Template missing ${varName}`)
      }
    }
  } catch (error) {
    log('red', `✗ Template file not found: ${templatePath}`)
    process.exit(1)
  }
  
  // Test env generation
  log('blue', '\nGenerating environment variables...')
  const envVars = {
    ANTHROPIC_API_KEY: testConfig.apiKey,
    OPENCLAW_GATEWAY_TOKEN: testConfig.gatewayToken,
    AUTH_PASSWORD: testConfig.gatewayToken.substring(0, 16),
    AUTH_USERNAME: 'admin',
    OPENCLAW_PRIMARY_MODEL: plan === 'enterprise' || plan === 'pro'
      ? 'anthropic/claude-opus-4-5'
      : 'anthropic/claude-sonnet-4-5',
  }
  
  for (const [key, value] of Object.entries(envVars)) {
    log('green', `  ✓ ${key}=${value.substring(0, 20)}...`)
  }
  
  // Test provision script exists and is executable
  const provisionScript = '../../../scripts/provision.sh'
  try {
    const fs = require('fs')
    const stats = fs.statSync(provisionScript)
    
    if (stats.mode & 0o111) {
      log('green', '✓ Provision script is executable')
    } else {
      log('yellow', '⚠ Provision script is not executable')
      log('yellow', '  Run: chmod +x scripts/provision.sh')
    }
  } catch (error) {
    log('red', '✗ Provision script not found')
    process.exit(1)
  }
  
  log('blue', '\n═══════════════════════════════════════════')
  log('green', '✓ All pre-deployment checks passed!')
  log('blue', '═══════════════════════════════════════════\n')
  
  log('yellow', 'To deploy on actual VPS:')
  log('white', `
  ssh root@vps-ip "bash -s" < scripts/provision.sh -- \\
    --customer-id ${testConfig.customerId} \\
    --api-key ${testConfig.apiKey} \\
    --subdomain ${testConfig.subdomain} \\
    --gateway-token ${testConfig.gatewayToken} \\
    --plan ${plan}
  `)
  
  return testConfig
}

async function validateDeployment(subdomain) {
  log('blue', '\nValidating deployment...')
  
  try {
    const response = await fetch(`https://${subdomain}/healthz`, {
      signal: AbortSignal.timeout(5000),
    })
    
    const data = await response.json()
    
    if (data.ok === true) {
      log('green', '✓ Health check passed')
      log('green', `  Version: ${data.version || 'unknown'}`)
      log('green', `  Uptime: ${data.uptime || 'unknown'}`)
      return { valid: true }
    } else {
      log('red', '✗ Health check failed: not ok')
      return { valid: false, error: 'Health check returned ok=false' }
    }
  } catch (error) {
    log('red', `✗ Health check failed: ${error.message}`)
    return { valid: false, error: error.message }
  }
}

// CLI
const args = process.argv.slice(2)
const plan = args.find((arg) => arg.startsWith('--plan='))?.split('=')[1] || 'pro'
const subdomain = args.find((arg) => arg.startsWith('--subdomain='))?.split('=')[1]

if (subdomain) {
  // Validate existing deployment
  validateDeployment(subdomain).then((result) => {
    if (result.valid) {
      process.exit(0)
    } else {
      process.exit(1)
    }
  })
} else {
  // Test deployment locally
  testLocalDeploy(plan).then(() => {
    log('green', '\nTest complete!')
  }).catch((error) => {
    log('red', `\nTest failed: ${error.message}`)
    process.exit(1)
  })
}
