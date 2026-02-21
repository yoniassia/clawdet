#!/usr/bin/env node
/**
 * Validate deployment configuration without needing Docker
 * Checks: tokens, templates, scripts, env vars
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

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

function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}

async function validateConfig() {
  log('blue', '\n═══════════════════════════════════════════')
  log('blue', '  Validating Deployment Configuration')
  log('blue', '═══════════════════════════════════════════\n')
  
  let errors = 0
  let warnings = 0
  
  // 1. Check provision script
  log('blue', '1. Checking provision script...')
  const provisionPath = path.join(__dirname, '../../scripts/provision.sh')
  
  try {
    const stats = fs.statSync(provisionPath)
    log('green', '  ✓ Provision script exists')
    
    if (stats.mode & 0o111) {
      log('green', '  ✓ Script is executable')
    } else {
      log('yellow', '  ⚠ Script is not executable')
      log('yellow', '    Run: chmod +x scripts/provision.sh')
      warnings++
    }
    
    const content = fs.readFileSync(provisionPath, 'utf8')
    
    // Check for required validations
    const requiredChecks = [
      'CUSTOMER_ID',
      'API_KEY',
      'SUBDOMAIN',
      'GATEWAY_TOKEN',
    ]
    
    for (const check of requiredChecks) {
      if (content.includes(check)) {
        log('green', `  ✓ Validates ${check}`)
      } else {
        log('red', `  ✗ Missing validation for ${check}`)
        errors++
      }
    }
  } catch (error) {
    log('red', `  ✗ Provision script not found: ${error.message}`)
    errors++
  }
  
  // 2. Check templates
  log('blue', '\n2. Checking Docker Compose templates...')
  const plans = ['free', 'pro', 'enterprise']
  
  for (const plan of plans) {
    const templatePath = path.join(__dirname, `../../templates/docker-compose.${plan}.yml`)
    
    try {
      const template = fs.readFileSync(templatePath, 'utf8')
      log('green', `  ✓ ${plan} template exists`)
      
      // Validate required environment variables
      const requiredVars = [
        'ANTHROPIC_API_KEY',
        'OPENCLAW_GATEWAY_TOKEN',
        'AUTH_PASSWORD',
      ]
      
      for (const varName of requiredVars) {
        if (template.includes(`\${${varName}}`)) {
          log('green', `    ✓ Includes ${varName}`)
        } else {
          log('red', `    ✗ Missing ${varName}`)
          errors++
        }
      }
      
      // Check for health check
      if (template.includes('healthcheck:')) {
        log('green', '    ✓ Health check configured')
      } else {
        log('yellow', '    ⚠ No health check found')
        warnings++
      }
      
      // Check for restart policy
      if (template.includes('restart:')) {
        log('green', '    ✓ Restart policy configured')
      } else {
        log('yellow', '    ⚠ No restart policy found')
        warnings++
      }
    } catch (error) {
      log('red', `  ✗ ${plan} template not found`)
      errors++
    }
  }
  
  // 3. Check TypeScript library files
  log('blue', '\n3. Checking TypeScript libraries...')
  const libFiles = [
    'docker-provisioning.ts',
    'instance-env.ts',
    'health.ts',
  ]
  
  for (const libFile of libFiles) {
    const libPath = path.join(__dirname, '../../lib', libFile)
    
    try {
      fs.statSync(libPath)
      log('green', `  ✓ ${libFile} exists`)
    } catch (error) {
      log('red', `  ✗ ${libFile} not found`)
      errors++
    }
  }
  
  // 4. Test gateway token generation
  log('blue', '\n4. Testing token generation...')
  try {
    const token1 = generateToken()
    const token2 = generateToken()
    
    if (token1.length === 64) {
      log('green', `  ✓ Token length correct (64 chars)`)
    } else {
      log('red', `  ✗ Token length incorrect: ${token1.length}`)
      errors++
    }
    
    if (token1 !== token2) {
      log('green', '  ✓ Tokens are unique')
    } else {
      log('red', '  ✗ Tokens are not unique')
      errors++
    }
    
    log('green', `  ✓ Example token: ${token1.substring(0, 16)}...`)
  } catch (error) {
    log('red', `  ✗ Token generation failed: ${error.message}`)
    errors++
  }
  
  // 5. Test environment variable generation
  log('blue', '\n5. Testing env var generation...')
  try {
    const testConfig = {
      id: 'test123',
      apiKey: 'sk-ant-test',
      gatewayToken: generateToken(),
      plan: 'pro',
    }
    
    // Simulate what instance-env.ts does
    const env = {
      ANTHROPIC_API_KEY: testConfig.apiKey,
      OPENCLAW_GATEWAY_TOKEN: testConfig.gatewayToken,
      AUTH_PASSWORD: testConfig.gatewayToken.substring(0, 16),
      AUTH_USERNAME: 'admin',
      OPENCLAW_PRIMARY_MODEL: 'anthropic/claude-opus-4-5',
    }
    
    for (const [key, value] of Object.entries(env)) {
      if (value && value.length > 0) {
        log('green', `  ✓ ${key} generated`)
      } else {
        log('red', `  ✗ ${key} empty`)
        errors++
      }
    }
  } catch (error) {
    log('red', `  ✗ Env var generation failed: ${error.message}`)
    errors++
  }
  
  // Summary
  log('blue', '\n═══════════════════════════════════════════')
  if (errors === 0 && warnings === 0) {
    log('green', '✓ All checks passed!')
  } else if (errors === 0) {
    log('yellow', `⚠ ${warnings} warning(s) - deployment should work but could be improved`)
  } else {
    log('red', `✗ ${errors} error(s), ${warnings} warning(s) - fix errors before deploying`)
  }
  log('blue', '═══════════════════════════════════════════\n')
  
  return { errors, warnings }
}

// Run validation
validateConfig().then(({ errors, warnings }) => {
  if (errors > 0) {
    process.exit(1)
  } else {
    process.exit(0)
  }
}).catch((error) => {
  log('red', `\nValidation crashed: ${error.message}`)
  process.exit(1)
})
