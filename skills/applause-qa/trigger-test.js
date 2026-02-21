#!/usr/bin/env node
/**
 * Trigger Applause Test Cycle
 * Starts a new test run with configured test cases
 */

const { config, isConfigured } = require('./config')
const fs = require('fs')
const path = require('path')

async function loadTestCases() {
  const testCasesPath = path.join(__dirname, 'test-cases.json')
  
  if (!fs.existsSync(testCasesPath)) {
    console.log('⚠️  No test-cases.json found, using defaults')
    return getDefaultTestCases()
  }
  
  const data = fs.readFileSync(testCasesPath, 'utf-8')
  return JSON.parse(data).tests
}

function getDefaultTestCases() {
  return [
    {
      name: 'Trial Chat - 5 Message Limit',
      url: 'https://clawdet.com/trial',
      instructions: `
1. Visit https://clawdet.com
2. Click "Try It Now" button
3. Verify chat interface loads within 3 seconds
4. Send 5 messages (any content)
5. Try to send 6th message

EXPECTED BEHAVIOR:
- First 5 messages send successfully
- AI responds to each message
- 6th message is BLOCKED
- User sees message: "Trial limit reached. Sign up to continue."
- "Sign Up" button appears

PASS if all expected behavior occurs.
FAIL if any step doesn't work or if behavior differs.

Take screenshots at each step.
      `.trim(),
      browsers: ['chrome', 'firefox', 'safari'],
      devices: ['desktop', 'mobile']
    },
    {
      name: 'OAuth Signup Flow',
      url: 'https://clawdet.com/signup',
      instructions: `
1. Click "Sign Up" button on homepage
2. Click "Continue with X" on signup page
3. Complete X (Twitter) OAuth authorization
4. After redirect, verify you land on /signup/details page
5. Should see: "Welcome, [Your Name]!"
6. Should see: "🎉 FREE BETA ACCESS!" (if you're in first 20 users)
7. Enter a valid email address
8. Check "I agree to Terms" checkbox
9. Click "Claim Free Beta Access" button
10. Should redirect to /dashboard

EXPECTED BEHAVIOR:
- No redirect loops
- OAuth completes successfully
- Free beta message shows (if eligible)
- Form validation works
- Redirect to dashboard succeeds

PASS if flow completes without errors.
FAIL if stuck in redirect loop, errors occur, or unexpected behavior.

Record video of the entire flow.
      `.trim(),
      browsers: ['chrome', 'safari'],
      devices: ['desktop', 'mobile']
    },
    {
      name: 'Instance Web Chat',
      url: 'https://test-fresh-1.clawdet.com',
      instructions: `
1. Visit https://test-fresh-1.clawdet.com
2. Wait for page to load
3. Verify "Chat" tab is active
4. Check connection status shows "Connected" (green dot)
5. Type "Hello, who are you?" and send
6. Verify AI responds within 10 seconds
7. Send 3 more messages
8. Refresh the page
9. Verify chat history persists

EXPECTED BEHAVIOR:
- Page loads within 5 seconds
- WebSocket connects (green "Connected" status)
- Messages send/receive in real-time
- AI responses are coherent
- Chat history persists after refresh

PASS if all functionality works.
FAIL if connection fails, messages don't send, or errors occur.
      `.trim(),
      browsers: ['chrome', 'firefox'],
      devices: ['desktop']
    }
  ]
}

async function triggerTestRun(options = {}) {
  console.log('🚀 Triggering Applause Test Cycle...\n')
  
  if (!isConfigured()) {
    console.error('❌ Applause not configured. Run: node skills/applause-qa/test-connection.js')
    process.exit(1)
  }
  
  // Load test cases
  const testCases = await loadTestCases()
  console.log(`📋 Loaded ${testCases.length} test cases`)
  
  // Prepare test run payload
  const payload = {
    product_id: config.productId,
    test_cycle_name: options.name || `Clawdet ${new Date().toISOString().split('T')[0]}`,
    test_type: 'functional',
    priority: options.priority || 'high',
    duration_hours: config.defaultTestDuration,
    tests: testCases.map(tc => ({
      name: tc.name,
      url: tc.url,
      instructions: tc.instructions,
      browsers: tc.browsers || config.defaultBrowsers,
      devices: tc.devices || config.defaultDevices,
      expected_result: `All steps complete without errors`
    })),
    notification_webhooks: options.webhooks || []
  }
  
  console.log(`\n📤 Sending test run request...`)
  console.log(`   Product ID: ${payload.product_id}`)
  console.log(`   Test Cases: ${payload.tests.length}`)
  console.log(`   Duration: ${payload.duration_hours}h`)
  
  try {
    const response = await fetch(`${config.autoApiUrl}/test-runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API returned ${response.status}: ${error}`)
    }
    
    const result = await response.json()
    
    console.log('\n✅ Test run created successfully!')
    console.log(`   Run ID: ${result.test_run_id || result.id}`)
    console.log(`   Status: ${result.status}`)
    console.log(`   Estimated completion: ${result.estimated_completion || 'TBD'}`)
    
    // Save run ID for later reference
    const runData = {
      run_id: result.test_run_id || result.id,
      created_at: new Date().toISOString(),
      status: result.status,
      test_count: testCases.length,
      result: result
    }
    
    const runsDir = path.join(__dirname, 'runs')
    if (!fs.existsSync(runsDir)) {
      fs.mkdirSync(runsDir)
    }
    
    fs.writeFileSync(
      path.join(runsDir, `${runData.run_id}.json`),
      JSON.stringify(runData, null, 2)
    )
    
    console.log(`\n📁 Run data saved: runs/${runData.run_id}.json`)
    console.log('\n📝 Next steps:')
    console.log(`   1. Monitor: node skills/applause-qa/get-results.js ${runData.run_id}`)
    console.log(`   2. Or wait for webhook notification (if configured)`)
    
    return runData
  } catch (error) {
    console.error(`\n❌ Failed to trigger test run: ${error.message}`)
    
    if (error.message.includes('401') || error.message.includes('403')) {
      console.log('\n💡 API authentication failed. Check your credentials:')
      console.log('   APPLAUSE_API_KEY in .env.local')
    } else if (error.message.includes('404')) {
      console.log('\n💡 API endpoint not found. Verify:')
      console.log(`   APPLAUSE_AUTO_API_URL=${config.autoApiUrl}`)
    }
    
    throw error
  }
}

// CLI support
if (require.main === module) {
  const args = process.argv.slice(2)
  const options = {}
  
  // Parse command line args
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--name' && args[i + 1]) {
      options.name = args[i + 1]
      i++
    } else if (args[i] === '--priority' && args[i + 1]) {
      options.priority = args[i + 1]
      i++
    }
  }
  
  triggerTestRun(options).catch(error => {
    process.exit(1)
  })
}

module.exports = { triggerTestRun }
