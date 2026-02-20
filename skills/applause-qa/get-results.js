#!/usr/bin/env node
/**
 * Get Applause Test Run Results
 * Fetches results and bug reports from a test run
 */

const { config, isConfigured } = require('./config')
const fs = require('fs')
const path = require('path')

async function getTestRunResults(runId) {
  console.log(`🔍 Fetching results for test run: ${runId}\n`)
  
  if (!isConfigured()) {
    console.error('❌ Applause not configured')
    process.exit(1)
  }
  
  try {
    // Fetch test run status
    console.log('📡 Fetching test run status...')
    const statusResponse = await fetch(`${config.autoApiUrl}/test-runs/${runId}`, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!statusResponse.ok) {
      throw new Error(`API returned ${statusResponse.status}`)
    }
    
    const runData = await statusResponse.json()
    
    console.log(`\n📊 Test Run Status`)
    console.log(`   Status: ${runData.status}`)
    console.log(`   Progress: ${runData.progress || 'N/A'}`)
    console.log(`   Tests: ${runData.total_tests || 'N/A'}`)
    
    if (runData.status === 'in_progress') {
      console.log(`\n⏳ Test run still in progress`)
      console.log(`   Estimated completion: ${runData.estimated_completion || 'TBD'}`)
      return { status: 'in_progress', data: runData }
    }
    
    // Fetch detailed results
    console.log('\n📡 Fetching detailed results...')
    const resultsResponse = await fetch(`${config.autoApiUrl}/test-runs/${runId}/results`, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!resultsResponse.ok) {
      throw new Error(`Results API returned ${resultsResponse.status}`)
    }
    
    const results = await resultsResponse.json()
    
    // Fetch bugs
    console.log('📡 Fetching bug reports...')
    const bugsResponse = await fetch(`${config.autoApiUrl}/test-runs/${runId}/bugs`, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    const bugs = bugsResponse.ok ? await bugsResponse.json() : { bugs: [] }
    
    // Display summary
    console.log(`\n✅ Test Run Complete!`)
    console.log(`   Total Tests: ${results.total_tests || 0}`)
    console.log(`   Passed: ${results.passed || 0}`)
    console.log(`   Failed: ${results.failed || 0}`)
    console.log(`   Bugs Found: ${bugs.bugs?.length || 0}`)
    
    if (bugs.bugs && bugs.bugs.length > 0) {
      console.log(`\n🐛 Bugs Found:`)
      bugs.bugs.forEach((bug, i) => {
        console.log(`   ${i + 1}. [${bug.severity}] ${bug.title}`)
        console.log(`      Device: ${bug.device?.model || 'Unknown'}`)
        console.log(`      Browser: ${bug.browser || 'Unknown'}`)
      })
      
      console.log(`\n📝 Next step: Sync bugs to GitHub`)
      console.log(`   node skills/applause-qa/sync-bugs.js ${runId}`)
    }
    
    // Save results
    const runsDir = path.join(__dirname, 'runs')
    if (!fs.existsSync(runsDir)) {
      fs.mkdirSync(runsDir)
    }
    
    const fullResults = {
      run_id: runId,
      fetched_at: new Date().toISOString(),
      status: runData.status,
      results: results,
      bugs: bugs.bugs || []
    }
    
    fs.writeFileSync(
      path.join(runsDir, `${runId}-results.json`),
      JSON.stringify(fullResults, null, 2)
    )
    
    console.log(`\n📁 Results saved: runs/${runId}-results.json`)
    
    return fullResults
  } catch (error) {
    console.error(`\n❌ Failed to fetch results: ${error.message}`)
    throw error
  }
}

// CLI support
if (require.main === module) {
  const runId = process.argv[2]
  
  if (!runId) {
    console.error('❌ Usage: node get-results.js <test_run_id>')
    process.exit(1)
  }
  
  getTestRunResults(runId).catch(() => process.exit(1))
}

module.exports = { getTestRunResults }
