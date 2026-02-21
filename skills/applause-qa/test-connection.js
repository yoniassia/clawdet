#!/usr/bin/env node
/**
 * Test Applause API Connection
 * Verifies credentials and API access
 */

const { config, validateConfig } = require('./config')

async function testConnection() {
  console.log('🔍 Testing Applause API Connection...\n')
  
  // Validate configuration
  const errors = validateConfig()
  if (errors.length > 0) {
    console.error('❌ Configuration Errors:')
    errors.forEach(err => console.error(`  - ${err}`))
    console.log('\n💡 Add credentials to .env.local:')
    console.log('   APPLAUSE_API_KEY=your_key')
    console.log('   APPLAUSE_PRODUCT_ID=12345')
    process.exit(1)
  }
  
  console.log('✅ Configuration loaded')
  console.log(`   API Key: ${config.apiKey.substring(0, 20)}...`)
  console.log(`   Product ID: ${config.productId}`)
  console.log(`   Auto API: ${config.autoApiUrl}`)
  console.log(`   Public API: ${config.publicApiUrl}\n`)
  
  // Test Auto API connection
  console.log('📡 Testing Auto API...')
  try {
    const response = await fetch(`${config.autoApiUrl}/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      console.log('✅ Auto API: Connected')
      const data = await response.json()
      console.log(`   Status: ${data.status || 'healthy'}`)
    } else {
      console.log(`⚠️  Auto API: HTTP ${response.status}`)
      const text = await response.text()
      console.log(`   Response: ${text.substring(0, 200)}`)
    }
  } catch (error) {
    console.error(`❌ Auto API: ${error.message}`)
  }
  
  // Test Public API connection
  console.log('\n📡 Testing Public API...')
  try {
    const response = await fetch(`${config.publicApiUrl}/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      console.log('✅ Public API: Connected')
      const data = await response.json()
      console.log(`   Status: ${data.status || 'healthy'}`)
    } else {
      console.log(`⚠️  Public API: HTTP ${response.status}`)
      const text = await response.text()
      console.log(`   Response: ${text.substring(0, 200)}`)
    }
  } catch (error) {
    console.error(`❌ Public API: ${error.message}`)
  }
  
  // Test GitHub access
  console.log('\n📡 Testing GitHub API...')
  try {
    const response = await fetch(`https://api.github.com/repos/${config.githubRepo}`, {
      headers: {
        'Authorization': `Bearer ${config.githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    
    if (response.ok) {
      const repo = await response.json()
      console.log('✅ GitHub API: Connected')
      console.log(`   Repo: ${repo.full_name}`)
      console.log(`   Access: ${repo.permissions.push ? 'Write' : 'Read'}`)
    } else {
      console.error(`❌ GitHub API: HTTP ${response.status}`)
    }
  } catch (error) {
    console.error(`❌ GitHub API: ${error.message}`)
  }
  
  console.log('\n🎉 Connection test complete!')
  console.log('\n📝 Next steps:')
  console.log('   1. Run: node skills/applause-qa/trigger-test.js')
  console.log('   2. Or: node skills/applause-qa/import-test-cases.js')
}

// Run if called directly
if (require.main === module) {
  testConnection().catch(error => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })
}

module.exports = { testConnection }
