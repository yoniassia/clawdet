/**
 * Manual Provisioning Test
 * 
 * Creates a test user and triggers provisioning
 */

import { upsertUser, findUserById, updateUser } from './lib/db'
import { startProvisioningJob, getProvisioningStatus } from './lib/provisioner'

async function main() {
  console.log('🧪 Manual Provisioning Test')
  console.log('===========================\n')

  // Step 1: Create test user
  console.log('📋 Step 1: Creating test user...')
  const testUser = upsertUser({
    xId: `test_${Date.now()}`,
    xUsername: `testuser${Date.now().toString().slice(-4)}`,
    xName: 'Test User',
    xProfileImage: 'https://example.com/avatar.jpg',
    email: 'test@example.com',
    termsAccepted: true,
    paid: true // Mark as paid
  })

  console.log(`✅ User created: ${testUser.id}`)
  console.log(`   Username: ${testUser.xUsername}`)
  console.log(`   Email: ${testUser.email}\n`)

  // Step 2: Trigger provisioning
  console.log('📋 Step 2: Triggering provisioning...')
  await startProvisioningJob(testUser.id)
  console.log('✅ Provisioning job started\n')

  // Step 3: Monitor status
  console.log('📋 Step 3: Monitoring provisioning status...\n')
  
  let attempts = 0
  const maxAttempts = 10
  
  while (attempts < maxAttempts) {
    attempts++
    
    // Wait a bit between checks
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const status = getProvisioningStatus(testUser.id)
    if (!status) {
      console.log('❌ Could not get status')
      break
    }
    
    console.log(`[${attempts}/${maxAttempts}] Status: ${status.status}`)
    console.log(`   Progress: ${status.progress}%`)
    console.log(`   Message: ${status.message}`)
    
    if (status.vpsId) {
      console.log(`   VPS ID: ${status.vpsId}`)
    }
    
    if (status.instanceUrl) {
      console.log(`   Instance URL: ${status.instanceUrl}`)
    }
    
    console.log('')
    
    // Check if complete or failed
    if (status.status === 'complete') {
      console.log('✅ PROVISIONING COMPLETE!')
      console.log(`🎉 Instance ready at: ${status.instanceUrl}\n`)
      break
    }
    
    if (status.status === 'failed') {
      console.log('❌ PROVISIONING FAILED\n')
      break
    }
  }

  // Final status
  const finalUser = findUserById(testUser.id)
  if (finalUser) {
    console.log('📊 Final User State:')
    console.log('===================')
    console.log(`User ID: ${finalUser.id}`)
    console.log(`Username: ${finalUser.xUsername}`)
    console.log(`Email: ${finalUser.email}`)
    console.log(`Paid: ${finalUser.paid}`)
    console.log(`Provisioning Status: ${finalUser.provisioningStatus}`)
    console.log(`Instance URL: ${finalUser.instanceUrl || 'N/A'}`)
    console.log(`Hetzner VPS ID: ${finalUser.hetznerVpsId || 'N/A'}`)
  }
}

main().catch(error => {
  console.error('❌ Test failed:', error)
  process.exit(1)
})
