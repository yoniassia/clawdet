// Test Free Beta API

async function testFreeBeta() {
  console.log('🧪 Testing Free Beta System...\n')
  
  // Test 1: Check current user count
  console.log('1. Checking current provisioned user count...')
  const { getAllUsers } = await import('./lib/db')
  const users = getAllUsers()
  const provisionedCount = users.filter(u => 
    u.paid || u.provisioningStatus === 'complete' || u.provisioningStatus === 'installing'
  ).length
  
  console.log(`   ✅ Currently provisioned: ${provisionedCount}/20`)
  console.log(`   📊 Total users: ${users.length}`)
  console.log(`   🎁 Remaining beta spots: ${20 - provisionedCount}`)
  
  // Test 2: Verify free-beta route exists
  console.log('\n2. Verifying API route...')
  try {
    await import('./app/api/provisioning/free-beta/route')
    console.log('   ✅ Free beta API route exists')
  } catch (err) {
    console.log('   ❌ Free beta API route missing:', err)
    process.exit(1)
  }
  
  // Test 3: Check provisioning system
  console.log('\n3. Checking provisioning system...')
  try {
    const { startProvisioningJob } = await import('./lib/provisioner-v2')
    console.log('   ✅ Provisioning system loaded')
  } catch (err) {
    console.log('   ❌ Provisioning system error:', err)
    process.exit(1)
  }
  
  // Test 4: List existing instances
  console.log('\n4. Current instances:')
  const instances = users.filter(u => u.instanceUrl)
  if (instances.length === 0) {
    console.log('   📝 No instances provisioned yet')
  } else {
    instances.forEach((u, i) => {
      console.log(`   ${i + 1}. @${u.xUsername} - ${u.instanceUrl} (${u.provisioningStatus})`)
    })
  }
  
  console.log('\n✨ Free Beta System: READY')
  console.log(`\n🎯 Status: ${20 - provisionedCount} free spots available`)
  console.log('🚀 Users can sign up at: https://clawdet.com/signup')
  console.log('📝 After X OAuth, they go to /dashboard')
  console.log('🎁 Dashboard shows "Get My Free Instance Now" button')
  console.log('⚙️  Clicking starts provisioning via /api/provisioning/free-beta')
}

testFreeBeta().catch(console.error)
