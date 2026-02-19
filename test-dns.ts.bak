/**
 * Test Cloudflare DNS functionality
 */

import * as dotenv from 'dotenv'
import { createSubdomain, deleteSubdomain, waitForDNSPropagation } from './lib/cloudflare'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function testDNS() {
  console.log('🧪 Testing Cloudflare DNS...\n')

  const testUsername = 'test-' + Date.now()
  const testIP = '188.34.197.212' // clawdet.com main server

  try {
    // Test 1: Create subdomain
    console.log(`1️⃣ Creating subdomain: ${testUsername}.clawdet.com → ${testIP}`)
    const createResult = await createSubdomain(testUsername, testIP, true)
    
    if (!createResult.success) {
      console.error('❌ Create failed:', createResult.error)
      return
    }
    
    console.log('✅ Subdomain created:', createResult.subdomain)
    console.log('')

    // Test 2: Wait for DNS propagation
    console.log(`2️⃣ Waiting for DNS propagation...`)
    const propagated = await waitForDNSPropagation(`${testUsername}.clawdet.com`, testIP, 6, 5000)
    
    if (propagated) {
      console.log('✅ DNS propagated successfully')
    } else {
      console.log('⚠️  DNS propagation timeout (may still work)')
    }
    console.log('')

    // Test 3: Delete subdomain (cleanup)
    console.log(`3️⃣ Cleaning up: deleting ${testUsername}.clawdet.com`)
    const deleteResult = await deleteSubdomain(testUsername)
    
    if (deleteResult.success) {
      console.log('✅ Subdomain deleted')
    } else {
      console.error('❌ Delete failed:', deleteResult.error)
    }
    console.log('')

    console.log('🎉 All DNS tests completed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run tests
testDNS()
