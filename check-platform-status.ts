// Quick Platform Status Check

async function checkStatus() {
  console.log('🔍 Clawdet Platform Status\n')
  console.log('Time:', new Date().toISOString(), '\n')
  
  // 1. Check database
  try {
    const { getAllUsers } = await import('./lib/db')
    const users = getAllUsers()
    const provisionedCount = users.filter(u => 
      u.paid || u.provisioningStatus === 'complete' || u.provisioningStatus === 'installing'
    ).length
    
    console.log('📊 Database Status:')
    console.log(`   Total users: ${users.length}`)
    console.log(`   Provisioned: ${provisionedCount}/20`)
    console.log(`   Free spots remaining: ${20 - provisionedCount}`)
  } catch (err) {
    console.log('❌ Database error:', err)
  }
  
  // 2. Check files
  console.log('\n📁 Recent Files:')
  const { execSync } = await import('child_process')
  const files = execSync('ls -lt *.md | head -5', { cwd: '/root/.openclaw/workspace/clawdet' }).toString()
  console.log(files)
  
  // 3. Check PM2
  console.log('🔧 PM2 Status:')
  const pm2Status = execSync('pm2 status').toString()
  console.log(pm2Status)
  
  // 4. Check URLs
  console.log('\n🌐 URL Tests:')
  const mainStatus = execSync('curl -sI https://clawdet.com | head -1').toString().trim()
  const testStatus = execSync('curl -sI https://clawdet-test.clawdet.com | head -1').toString().trim()
  console.log(`   Main site: ${mainStatus}`)
  console.log(`   Test instance: ${testStatus}`)
  
  console.log('\n✅ Status check complete')
}

checkStatus().catch(console.error)
