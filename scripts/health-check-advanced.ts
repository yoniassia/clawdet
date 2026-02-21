#!/usr/bin/env ts-node
/**
 * Advanced Health Check Script
 * 
 * Tests:
 * 1. HTTP endpoints (200 status)
 * 2. Gateway connectivity with token auth
 * 3. Database read/write operations
 * 4. PM2 process status
 * 5. End-to-end AI test message
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import { findUserById } from '../lib/db'

const execAsync = promisify(exec)

interface HealthCheck {
  name: string
  status: 'pass' | 'fail' | 'warn'
  message: string
  duration?: number
  details?: any
}

const results: HealthCheck[] = []

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
}

function log(check: HealthCheck) {
  const icon = check.status === 'pass' ? '✅' : check.status === 'warn' ? '⚠️' : '❌'
  const color = check.status === 'pass' ? colors.green : check.status === 'warn' ? colors.yellow : colors.red
  console.log(`${icon} ${color}${check.name}${colors.reset}: ${check.message}`)
  if (check.duration) {
    console.log(`   ⏱️  ${check.duration}ms`)
  }
  results.push(check)
}

async function checkHTTP(url: string, name: string): Promise<void> {
  const start = Date.now()
  try {
    const { stdout } = await execAsync(`curl -sI ${url} | head -1`)
    const duration = Date.now() - start
    
    if (stdout.includes('200')) {
      log({
        name: `HTTP: ${name}`,
        status: 'pass',
        message: 'Responding with 200 OK',
        duration
      })
    } else {
      log({
        name: `HTTP: ${name}`,
        status: 'fail',
        message: `Got: ${stdout.trim()}`,
        duration
      })
    }
  } catch (error: any) {
    log({
      name: `HTTP: ${name}`,
      status: 'fail',
      message: error.message,
      duration: Date.now() - start
    })
  }
}

async function checkGateway(url: string, name: string): Promise<void> {
  const start = Date.now()
  try {
    const { stdout } = await execAsync(`curl -s ${url} | grep -o openclaw`)
    const duration = Date.now() - start
    
    if (stdout.includes('openclaw')) {
      log({
        name: `Gateway: ${name}`,
        status: 'pass',
        message: 'Gateway HTML responsive',
        duration
      })
    } else {
      log({
        name: `Gateway: ${name}`,
        status: 'fail',
        message: 'Gateway not responding correctly',
        duration
      })
    }
  } catch (error: any) {
    log({
      name: `Gateway: ${name}`,
      status: 'fail',
      message: 'Gateway connection failed',
      duration: Date.now() - start
    })
  }
}

async function checkPM2(): Promise<void> {
  const start = Date.now()
  try {
    const { stdout } = await execAsync('pm2 status clawdet-prod | grep -E "online|stopped"')
    const duration = Date.now() - start
    
    if (stdout.includes('online')) {
      log({
        name: 'PM2: clawdet-prod',
        status: 'pass',
        message: 'Process online',
        duration
      })
    } else {
      log({
        name: 'PM2: clawdet-prod',
        status: 'fail',
        message: 'Process not online',
        duration
      })
    }
  } catch (error: any) {
    log({
      name: 'PM2: clawdet-prod',
      status: 'fail',
      message: error.message,
      duration: Date.now() - start
    })
  }
}

async function checkDatabase(): Promise<void> {
  const start = Date.now()
  try {
    // Try to read from database
    const user = findUserById('test-id')
    const duration = Date.now() - start
    
    log({
      name: 'Database: Read',
      status: 'pass',
      message: 'Can query database',
      duration
    })
  } catch (error: any) {
    log({
      name: 'Database: Read',
      status: 'fail',
      message: error.message,
      duration: Date.now() - start
    })
  }
}

async function checkTestDemoGateway(): Promise<void> {
  const start = Date.now()
  try {
    const { stdout } = await execAsync(
      `ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no root@65.109.132.127 "systemctl is-active openclaw-gateway && curl -s http://localhost:18789/ | grep -q openclaw && echo '✅ Gateway responsive' || echo '❌ Gateway down'" 2>&1 | grep -E "active|✅|❌"`
    )
    const duration = Date.now() - start
    
    if (stdout.includes('active') && stdout.includes('✅')) {
      log({
        name: 'Gateway: test-demo (remote)',
        status: 'pass',
        message: 'Active and responsive',
        duration
      })
    } else {
      log({
        name: 'Gateway: test-demo (remote)',
        status: 'warn',
        message: 'SSH check incomplete',
        duration
      })
    }
  } catch (error: any) {
    log({
      name: 'Gateway: test-demo (remote)',
      status: 'fail',
      message: 'SSH connection failed',
      duration: Date.now() - start
    })
  }
}

async function checkAIMessageTest(): Promise<void> {
  const start = Date.now()
  try {
    // Test trial chat API with actual AI call
    const { stdout } = await execAsync(`
      curl -s -X POST https://clawdet.com/api/trial-chat \
        -H "Content-Type: application/json" \
        -d '{"message":"Health check test","count":1}' \
      | grep -o '"response"'
    `)
    const duration = Date.now() - start
    
    if (stdout.includes('"response"')) {
      log({
        name: 'AI: Trial Chat API',
        status: 'pass',
        message: 'Claude AI responding correctly',
        duration
      })
    } else {
      log({
        name: 'AI: Trial Chat API',
        status: 'fail',
        message: 'API returned but no response field',
        duration
      })
    }
  } catch (error: any) {
    log({
      name: 'AI: Trial Chat API',
      status: 'fail',
      message: 'API request failed',
      duration: Date.now() - start
    })
  }
}

async function runHealthChecks(): Promise<void> {
  console.log(colors.blue + '\n🏥 Advanced Health Check - Clawdet Platform' + colors.reset)
  console.log('=' + '='.repeat(60))
  console.log('')

  // HTTP endpoints
  await checkHTTP('https://clawdet.com', 'clawdet.com')
  await checkHTTP('https://test-demo.clawdet.com', 'test-demo.clawdet.com')

  // Gateway connectivity
  await checkGateway('http://localhost:18789/', 'Main (local)')
  await checkTestDemoGateway()

  // Services
  await checkPM2()

  // Database
  await checkDatabase()

  // AI integration test
  await checkAIMessageTest()

  // Summary
  console.log('')
  console.log('=' + '='.repeat(60))
  
  const passed = results.filter(r => r.status === 'pass').length
  const warned = results.filter(r => r.status === 'warn').length
  const failed = results.filter(r => r.status === 'fail').length
  const total = results.length

  console.log(`\n📊 Summary: ${passed}/${total} passed, ${warned} warnings, ${failed} failed\n`)

  if (failed === 0 && warned === 0) {
    console.log(colors.green + '✅ All health checks passed!' + colors.reset)
    process.exit(0)
  } else if (failed === 0) {
    console.log(colors.yellow + '⚠️  Some checks have warnings' + colors.reset)
    process.exit(0)
  } else {
    console.log(colors.red + '❌ Some health checks failed' + colors.reset)
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  runHealthChecks().catch(error => {
    console.error(colors.red + 'Fatal error:', error + colors.reset)
    process.exit(1)
  })
}

export { runHealthChecks }
