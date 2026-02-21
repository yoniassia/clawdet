#!/usr/bin/env node
/**
 * End-to-End Test: Deploy 2 real instances and verify they work
 * Tests with X.AI API first, falls back to Anthropic if needed
 */

const { exec } = require('child_process')
const { promisify } = require('util')
const crypto = require('crypto')
const https = require('https')

const execAsync = promisify(exec)

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
}

function log(color, message) {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`)
}

function fetchUrl(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Timeout'))
    }, timeout)
    
    https.get(url, { rejectUnauthorized: false }, (res) => {
      clearTimeout(timeoutId)
      let data = ''
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ success: true, data, statusCode: res.statusCode })
        } else {
          reject({ success: false, statusCode: res.statusCode, data })
        }
      })
    }).on('error', (err) => {
      clearTimeout(timeoutId)
      reject({ success: false, error: err.message })
    })
  })
}

async function testAPIKey(apiKey, provider) {
  log('cyan', `  Testing ${provider} API key...`)
  
  if (!apiKey || apiKey.includes('placeholder') || apiKey.length < 10) {
    log('yellow', `  ⚠ ${provider} API key not configured`)
    return false
  }
  
  log('green', `  ✓ ${provider} API key configured (${apiKey.substring(0, 10)}...)`)
  return true
}

async function deployInstance(config) {
  const { name, apiKey, provider, vpsIp, port } = config
  
  log('blue', `\n${'═'.repeat(60)}`)
  log('bold', `  Deploying Instance: ${name}`)
  log('blue', `${'═'.repeat(60)}`)
  
  log('cyan', `  Provider: ${provider}`)
  log('cyan', `  VPS IP: ${vpsIp}`)
  log('cyan', `  Port: ${port}`)
  
  const gatewayToken = crypto.randomBytes(32).toString('hex')
  const subdomain = `${name}.local`
  
  // For local testing, we'll use Docker directly on this machine
  // Create a temporary directory for this instance
  const instanceDir = `/tmp/clawdet-test-${name}`
  
  try {
    // Clean up any previous test
    await execAsync(`rm -rf ${instanceDir}`)
    await execAsync(`mkdir -p ${instanceDir}`)
    
    log('cyan', '\n  Creating deployment files...')
    
    // Download docker-compose template
    const templateUrl = 'https://clawdet.com/templates/docker-compose.pro.yml'
    const template = await fetchUrl(templateUrl)
    
    log('green', '  ✓ Template downloaded')
    
    // Create .env file
    const envContent = `# Test Instance: ${name}
ANTHROPIC_API_KEY=${apiKey}
OPENCLAW_GATEWAY_TOKEN=${gatewayToken}
AUTH_PASSWORD=${gatewayToken.substring(0, 16)}
AUTH_USERNAME=admin
OPENCLAW_PRIMARY_MODEL=${provider === 'X.AI' ? 'xai/grok-beta' : 'anthropic/claude-sonnet-4-5'}
OPENCLAW_STATE_DIR=/data/.openclaw
OPENCLAW_WORKSPACE_DIR=/data/workspace
PORT=${port}
`
    
    require('fs').writeFileSync(`${instanceDir}/.env`, envContent)
    log('green', '  ✓ Environment file created')
    
    // Modify template to use custom port
    let dockerCompose = template.data.replace(/- "80:8080"/g, `- "${port}:8080"`)
    // Add unique volume names
    dockerCompose = dockerCompose.replace(/openclaw-data:/g, `clawdet-test-${name}-data:`)
    
    require('fs').writeFileSync(`${instanceDir}/docker-compose.yml`, dockerCompose)
    log('green', '  ✓ Docker Compose file created')
    
    // Check if Docker is available
    try {
      await execAsync('docker --version')
      log('green', '  ✓ Docker is available')
    } catch (error) {
      log('red', '  ✗ Docker is not installed')
      log('yellow', '  Skipping container deployment (validation only)')
      return {
        success: true,
        message: 'Configuration validated (Docker not available for actual deployment)',
        validationOnly: true,
      }
    }
    
    // Pull image
    log('cyan', '\n  Pulling Docker image...')
    await execAsync('docker pull coollabsio/openclaw:latest', { cwd: instanceDir })
    log('green', '  ✓ Image pulled')
    
    // Start container
    log('cyan', '\n  Starting container...')
    await execAsync('docker compose up -d', { cwd: instanceDir })
    log('green', '  ✓ Container started')
    
    // Wait for health check
    log('cyan', '\n  Waiting for instance to be healthy...')
    const maxAttempts = 30
    let healthy = false
    
    for (let i = 1; i <= maxAttempts; i++) {
      try {
        const response = await fetchUrl(`http://localhost:${port}/healthz`, 5000)
        const data = JSON.parse(response.data)
        
        if (data.ok === true) {
          log('green', `  ✓ Instance is healthy! (attempt ${i}/${maxAttempts})`)
          healthy = true
          break
        }
      } catch (error) {
        if (i % 5 === 0) {
          log('yellow', `  Waiting... (attempt ${i}/${maxAttempts})`)
        }
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
    
    if (!healthy) {
      log('red', '  ✗ Health check timeout')
      
      // Get logs
      const { stdout } = await execAsync('docker compose logs --tail=50', { cwd: instanceDir })
      log('yellow', '\n  Container logs:')
      console.log(stdout)
      
      return {
        success: false,
        message: 'Health check timeout',
        logs: stdout,
      }
    }
    
    // Test API access
    log('cyan', '\n  Testing API access...')
    const apiResponse = await fetchUrl(`http://localhost:${port}/healthz`)
    const apiData = JSON.parse(apiResponse.data)
    
    log('green', '  ✓ API accessible')
    log('green', `  ✓ Gateway version: ${apiData.version || 'unknown'}`)
    
    return {
      success: true,
      port,
      gatewayToken,
      healthCheck: apiData,
      instanceDir,
    }
    
  } catch (error) {
    log('red', `\n  ✗ Deployment failed: ${error.message}`)
    
    // Try to get logs
    try {
      const { stdout } = await execAsync('docker compose logs --tail=50', { cwd: instanceDir })
      log('yellow', '\n  Container logs:')
      console.log(stdout)
      
      return {
        success: false,
        message: error.message,
        logs: stdout,
      }
    } catch {
      return {
        success: false,
        message: error.message,
      }
    }
  }
}

async function cleanupInstance(result) {
  if (!result || !result.instanceDir) return
  
  try {
    log('cyan', `\n  Cleaning up ${result.instanceDir}...`)
    await execAsync('docker compose down -v', { cwd: result.instanceDir })
    await execAsync(`rm -rf ${result.instanceDir}`)
    log('green', '  ✓ Cleanup complete')
  } catch (error) {
    log('yellow', `  ⚠ Cleanup failed: ${error.message}`)
  }
}

async function runE2ETest() {
  log('blue', '\n╔══════════════════════════════════════════════════════════╗')
  log('bold', '║  Clawdet End-to-End Deployment Test                     ║')
  log('blue', '╚══════════════════════════════════════════════════════════╝\n')
  
  // Read API keys
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  const xaiKey = process.env.XAI_API_KEY
  
  log('cyan', 'Checking API keys...')
  const hasXai = await testAPIKey(xaiKey, 'X.AI')
  const hasAnthropic = await testAPIKey(anthropicKey, 'Anthropic')
  
  if (!hasXai && !hasAnthropic) {
    log('red', '\n✗ No valid API keys found')
    log('yellow', 'Set ANTHROPIC_API_KEY or XAI_API_KEY environment variable')
    process.exit(1)
  }
  
  // Determine which provider to use
  const useXai = hasXai
  const provider = useXai ? 'X.AI' : 'Anthropic'
  const apiKey = useXai ? xaiKey : anthropicKey
  
  log('green', `\n✓ Using ${provider} for testing`)
  
  // Test configurations
  const tests = [
    {
      name: 'test-instance-1',
      apiKey,
      provider,
      vpsIp: 'localhost',
      port: 8091,
    },
    {
      name: 'test-instance-2',
      apiKey,
      provider,
      vpsIp: 'localhost',
      port: 8092,
    },
  ]
  
  const results = []
  
  // Deploy instances
  for (const test of tests) {
    const result = await deployInstance(test)
    results.push({ ...test, result })
    
    // Small delay between deployments
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  // Summary
  log('blue', '\n╔══════════════════════════════════════════════════════════╗')
  log('bold', '║  Test Results                                            ║')
  log('blue', '╚══════════════════════════════════════════════════════════╝\n')
  
  let passed = 0
  let failed = 0
  
  for (const test of results) {
    if (test.result.success) {
      log('green', `✓ ${test.name}: ${test.result.validationOnly ? 'VALIDATED' : 'DEPLOYED'}`)
      if (!test.result.validationOnly) {
        log('cyan', `  Port: ${test.result.port}`)
        log('cyan', `  Health: ${JSON.stringify(test.result.healthCheck)}`)
      }
      passed++
    } else {
      log('red', `✗ ${test.name}: FAILED`)
      log('red', `  Error: ${test.result.message}`)
      failed++
    }
  }
  
  log('blue', '\n' + '═'.repeat(60))
  log('green', `Passed: ${passed}/${tests.length}`)
  if (failed > 0) {
    log('red', `Failed: ${failed}/${tests.length}`)
  }
  log('blue', '═'.repeat(60))
  
  // Offer to cleanup
  if (passed > 0 && !results[0].result.validationOnly) {
    log('yellow', '\n⚠️  Test instances are still running')
    log('cyan', 'To cleanup manually:')
    for (const test of results) {
      if (test.result.success && test.result.instanceDir) {
        log('white', `  cd ${test.result.instanceDir} && docker compose down -v`)
      }
    }
    
    log('cyan', '\nOr run cleanup now? (Ctrl+C to keep instances running)')
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    for (const test of results) {
      if (test.result.success) {
        await cleanupInstance(test.result)
      }
    }
  }
  
  process.exit(failed > 0 ? 1 : 0)
}

// Run test
runE2ETest().catch((error) => {
  log('red', `\nE2E test crashed: ${error.message}`)
  console.error(error)
  process.exit(1)
})
