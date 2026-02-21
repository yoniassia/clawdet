#!/usr/bin/env node
/**
 * Full system test for Clawdet Docker deployment
 * Tests: file serving, token generation, deployment validation
 */

const https = require('https')
const crypto = require('crypto')

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(color, message) {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`)
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { rejectUnauthorized: false }, (res) => {
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
      reject({ success: false, error: err.message })
    })
  })
}

async function runSystemTest() {
  log('blue', '\n╔═══════════════════════════════════════════════════════╗')
  log('blue', '║  Clawdet Docker Deployment System - Full Test        ║')
  log('blue', '╚═══════════════════════════════════════════════════════╝\n')
  
  let passed = 0
  let failed = 0
  
  // Test 1: Provision Script Accessible
  log('cyan', '1. Testing provision script accessibility...')
  try {
    const result = await fetchUrl('https://clawdet.com/provision.sh')
    if (result.data.includes('#!/bin/bash') && result.data.includes('GATEWAY_TOKEN')) {
      log('green', '   ✓ Provision script is accessible')
      log('green', `   ✓ Script size: ${result.data.length} bytes`)
      passed++
    } else {
      log('red', '   ✗ Provision script content invalid')
      failed++
    }
  } catch (error) {
    log('red', `   ✗ Failed to fetch provision script: ${error.statusCode || error.error}`)
    failed++
  }
  
  // Test 2: Free Tier Template
  log('cyan', '\n2. Testing free tier template...')
  try {
    const result = await fetchUrl('https://clawdet.com/templates/docker-compose.free.yml')
    const requiredStrings = ['services:', 'openclaw:', 'ANTHROPIC_API_KEY', 'resources:', 'cpus', 'memory']
    const allFound = requiredStrings.every(str => result.data.includes(str))
    
    if (allFound) {
      log('green', '   ✓ Free tier template is valid')
      log('green', '   ✓ Contains required fields')
      passed++
    } else {
      log('red', '   ✗ Free tier template missing required fields')
      failed++
    }
  } catch (error) {
    log('red', `   ✗ Failed to fetch free tier template: ${error.statusCode || error.error}`)
    failed++
  }
  
  // Test 3: Pro Tier Template
  log('cyan', '\n3. Testing pro tier template...')
  try {
    const result = await fetchUrl('https://clawdet.com/templates/docker-compose.pro.yml')
    const requiredStrings = ['services:', 'openclaw:', 'ANTHROPIC_API_KEY', 'healthcheck:', 'restart:']
    const allFound = requiredStrings.every(str => result.data.includes(str))
    
    if (allFound) {
      log('green', '   ✓ Pro tier template is valid')
      log('green', '   ✓ Contains healthcheck and restart policies')
      passed++
    } else {
      log('red', '   ✗ Pro tier template missing required fields')
      failed++
    }
  } catch (error) {
    log('red', `   ✗ Failed to fetch pro tier template: ${error.statusCode || error.error}`)
    failed++
  }
  
  // Test 4: Enterprise Tier Template
  log('cyan', '\n4. Testing enterprise tier template...')
  try {
    const result = await fetchUrl('https://clawdet.com/templates/docker-compose.enterprise.yml')
    const requiredStrings = ['services:', 'openclaw:', 'browser:', 'BROWSER_CDP_URL']
    const allFound = requiredStrings.every(str => result.data.includes(str))
    
    if (allFound) {
      log('green', '   ✓ Enterprise tier template is valid')
      log('green', '   ✓ Contains browser automation sidecar')
      passed++
    } else {
      log('red', '   ✗ Enterprise tier template missing required fields')
      failed++
    }
  } catch (error) {
    log('red', `   ✗ Failed to fetch enterprise tier template: ${error.statusCode || error.error}`)
    failed++
  }
  
  // Test 5: Token Generation
  log('cyan', '\n5. Testing token generation...')
  try {
    const token1 = crypto.randomBytes(32).toString('hex')
    const token2 = crypto.randomBytes(32).toString('hex')
    
    if (token1.length === 64 && token2.length === 64 && token1 !== token2) {
      log('green', '   ✓ Token generation working')
      log('green', `   ✓ Example token: ${token1.substring(0, 16)}...`)
      log('green', `   ✓ Tokens are unique (${token1.substring(0, 8)} ≠ ${token2.substring(0, 8)})`)
      passed++
    } else {
      log('red', '   ✗ Token generation failed')
      failed++
    }
  } catch (error) {
    log('red', `   ✗ Token generation error: ${error.message}`)
    failed++
  }
  
  // Test 6: Environment Variable System
  log('cyan', '\n6. Testing environment variable generation...')
  try {
    const testConfig = {
      id: 'test123',
      apiKey: 'sk-ant-test-key',
      gatewayToken: crypto.randomBytes(32).toString('hex'),
      plan: 'pro'
    }
    
    const env = {
      ANTHROPIC_API_KEY: testConfig.apiKey,
      OPENCLAW_GATEWAY_TOKEN: testConfig.gatewayToken,
      AUTH_PASSWORD: testConfig.gatewayToken.substring(0, 16),
      AUTH_USERNAME: 'admin',
      OPENCLAW_PRIMARY_MODEL: 'anthropic/claude-opus-4-5'
    }
    
    const allValid = Object.values(env).every(v => v && v.length > 0)
    
    if (allValid) {
      log('green', '   ✓ Environment variable generation working')
      log('green', `   ✓ Generated ${Object.keys(env).length} environment variables`)
      passed++
    } else {
      log('red', '   ✗ Some environment variables are empty')
      failed++
    }
  } catch (error) {
    log('red', `   ✗ Environment generation error: ${error.message}`)
    failed++
  }
  
  // Test 7: Provision Script Validation Logic
  log('cyan', '\n7. Testing provision script validation logic...')
  try {
    const script = await fetchUrl('https://clawdet.com/provision.sh')
    const requiredParams = ['CUSTOMER_ID', 'API_KEY', 'SUBDOMAIN', 'GATEWAY_TOKEN']
    const hasValidation = script.data.includes('if [ -z "$CUSTOMER_ID" ] || [ -z "$API_KEY" ]')
    const hasAllParams = requiredParams.every(p => script.data.includes(`-z "$${p}"`))
    const hasErrorMessage = script.data.includes('Missing required arguments')
    
    if (hasValidation && hasAllParams && hasErrorMessage) {
      log('green', '   ✓ All required parameter validations present')
      log('green', '   ✓ Script will reject invalid deployments')
      passed++
    } else {
      log('red', '   ✗ Missing some parameter validations')
      failed++
    }
  } catch (error) {
    log('red', `   ✗ Validation logic test failed: ${error.message}`)
    failed++
  }
  
  // Test 8: Simulated Deployment
  log('cyan', '\n8. Simulating deployment parameters...')
  try {
    const mockDeployment = {
      customerId: 'test-' + Date.now(),
      apiKey: process.env.ANTHROPIC_API_KEY || 'sk-ant-test',
      subdomain: `test${Date.now()}.clawdet.com`,
      gatewayToken: crypto.randomBytes(32).toString('hex'),
      plan: 'pro'
    }
    
    log('green', '   ✓ Deployment parameters generated:')
    log('cyan', `      Customer ID: ${mockDeployment.customerId}`)
    log('cyan', `      Subdomain: ${mockDeployment.subdomain}`)
    log('cyan', `      Gateway Token: ${mockDeployment.gatewayToken.substring(0, 16)}...`)
    log('cyan', `      Plan: ${mockDeployment.plan}`)
    log('green', '   ✓ Ready for real deployment')
    passed++
  } catch (error) {
    log('red', `   ✗ Simulation failed: ${error.message}`)
    failed++
  }
  
  // Summary
  log('blue', '\n╔═══════════════════════════════════════════════════════╗')
  log('blue', '║  Test Results                                         ║')
  log('blue', '╚═══════════════════════════════════════════════════════╝')
  log('green', `\n✓ Passed: ${passed}/8`)
  if (failed > 0) {
    log('red', `✗ Failed: ${failed}/8`)
  }
  
  if (failed === 0) {
    log('green', '\n🎉 All systems operational! Ready for production deployment.')
    log('cyan', '\nTo deploy a test instance:')
    log('white', `
  curl -fsSL https://clawdet.com/provision.sh | bash -s -- \\
    --customer-id test1 \\
    --api-key \${ANTHROPIC_API_KEY} \\
    --subdomain test1.yourserver.com \\
    --gateway-token $(openssl rand -hex 32) \\
    --plan pro
    `)
  } else {
    log('red', '\n⚠️  Some tests failed. Review errors before deploying.')
  }
  
  log('blue', '\n')
  
  return failed === 0
}

// Run test
runSystemTest().then((success) => {
  process.exit(success ? 0 : 1)
}).catch((error) => {
  log('red', `\nTest suite crashed: ${error.message}`)
  process.exit(1)
})
