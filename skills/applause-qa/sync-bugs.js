#!/usr/bin/env node
/**
 * Sync Applause Bugs to GitHub Issues
 * Creates GitHub issues for each bug found in test run
 */

const { config, isConfigured } = require('./config')
const fs = require('fs')
const path = require('path')

async function createGitHubIssue(bug) {
  const issueBody = `## 🐛 Bug Report from Applause Testing

**Test**: ${bug.test_name || 'Unknown'}  
**Severity**: ${bug.severity || 'Unknown'}  
**Status**: ${bug.status || 'New'}

### Device & Browser
- **Device**: ${bug.device?.model || 'Unknown'} (${bug.device?.os || 'Unknown'})
- **Browser**: ${bug.browser || 'Unknown'}
- **Tester Location**: ${bug.tester?.country || 'Unknown'}

### Description
${bug.description || bug.title}

### Steps to Reproduce
${bug.steps_to_reproduce || 'See test instructions'}

### Expected Result
${bug.expected_result || 'See test case definition'}

### Actual Result
${bug.actual_result || 'Bug occurred during testing'}

### Screenshots
${bug.screenshots?.map(s => `![Screenshot](${s.url})`).join('\n') || 'No screenshots available'}

### Video Recording
${bug.video_url ? `[Watch Video](${bug.video_url})` : 'No video available'}

### Console Logs
${bug.console_logs ? `\`\`\`\n${bug.console_logs}\n\`\`\`` : 'No console logs'}

---

**Applause Bug ID**: ${bug.bug_id || bug.id}  
**Applause Link**: ${bug.applause_url || 'N/A'}  
**Reported**: ${bug.created_at || new Date().toISOString()}

<!-- applause-bug-id: ${bug.bug_id || bug.id} -->
`

  const labels = [
    'qa',
    'applause',
    bug.severity?.toLowerCase() || 'medium'
  ]
  
  if (bug.bug_type) {
    labels.push(bug.bug_type.toLowerCase())
  }

  const payload = {
    title: `[Applause] ${bug.title}`,
    body: issueBody,
    labels: labels
  }

  const response = await fetch(`https://api.github.com/repos/${config.githubRepo}/issues`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`GitHub API error: ${response.status} - ${error}`)
  }

  return await response.json()
}

async function syncBugsToGitHub(runId) {
  console.log(`🔄 Syncing bugs from test run: ${runId}\n`)
  
  if (!isConfigured()) {
    console.error('❌ Applause/GitHub not configured')
    process.exit(1)
  }
  
  // Load results from file
  const resultsPath = path.join(__dirname, 'runs', `${runId}-results.json`)
  
  if (!fs.existsSync(resultsPath)) {
    console.log('📡 Results not found locally, fetching from API...')
    const { getTestRunResults } = require('./get-results')
    await getTestRunResults(runId)
  }
  
  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'))
  const bugs = results.bugs || []
  
  if (bugs.length === 0) {
    console.log('✅ No bugs found in this test run!')
    return { created: 0, skipped: 0, errors: 0 }
  }
  
  console.log(`📋 Found ${bugs.length} bugs to sync\n`)
  
  const stats = { created: 0, skipped: 0, errors: 0 }
  
  for (const bug of bugs) {
    try {
      console.log(`📝 Creating issue for: ${bug.title}`)
      
      // Check if already synced
      if (bug.github_issue_number) {
        console.log(`   ⏭️  Already synced: #${bug.github_issue_number}`)
        stats.skipped++
        continue
      }
      
      const issue = await createGitHubIssue(bug)
      
      console.log(`   ✅ Created: #${issue.number}`)
      console.log(`   🔗 ${issue.html_url}`)
      
      // Mark as synced in results
      bug.github_issue_number = issue.number
      bug.github_issue_url = issue.html_url
      bug.synced_at = new Date().toISOString()
      
      stats.created++
      
      // Rate limit: wait 1 second between issues
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`)
      stats.errors++
    }
  }
  
  // Save updated results
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2))
  
  console.log(`\n✅ Sync complete!`)
  console.log(`   Created: ${stats.created}`)
  console.log(`   Skipped: ${stats.skipped}`)
  console.log(`   Errors: ${stats.errors}`)
  
  if (stats.created > 0) {
    console.log(`\n🔗 View issues: https://github.com/${config.githubRepo}/issues?q=is:issue+label:applause`)
  }
  
  return stats
}

// CLI support
if (require.main === module) {
  const runId = process.argv[2]
  
  if (!runId) {
    console.error('❌ Usage: node sync-bugs.js <test_run_id>')
    process.exit(1)
  }
  
  syncBugsToGitHub(runId).catch(() => process.exit(1))
}

module.exports = { syncBugsToGitHub, createGitHubIssue }
