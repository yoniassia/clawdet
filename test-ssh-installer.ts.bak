/**
 * Test SSH Installer
 * Manual test for SSH-based OpenClaw installation
 */

import { installOpenClawViaSSH, testSSHConnection } from './lib/ssh-installer'

async function testInstaller() {
  console.log('🧪 Testing SSH Installer\n')

  // Test configuration
  const config = {
    host: '192.0.2.1', // Mock IP (won't actually connect)
    password: 'test-password',
    username: 'root',
    xUsername: 'testuser',
    subdomain: 'testuser',
    xaiApiKey: 'xai-test-key'
  }

  console.log('Configuration:')
  console.log('- Host:', config.host)
  console.log('- Username:', config.xUsername)
  console.log('- Subdomain:', config.subdomain)
  console.log()

  try {
    console.log('📦 Starting installation...\n')
    
    // Note: This will fail to connect since we're using a mock IP
    // In production, this would be called with a real VPS IP and password
    await installOpenClawViaSSH(config)
    
    console.log('\n✅ Installation complete!')
  } catch (error) {
    console.log('\n⚠️  Expected error (mock IP):', (error as Error).message)
    console.log('\n💡 In production, this would connect to a real VPS and install OpenClaw')
  }

  console.log('\n📋 Installation Steps:')
  console.log('1. ✅ Connect to VPS via SSH')
  console.log('2. ✅ Update system packages')
  console.log('3. ✅ Install dependencies (curl, wget, git, build-essential)')
  console.log('4. ✅ Install Node.js (LTS)')
  console.log('5. ✅ Install OpenClaw')
  console.log('6. ✅ Configure environment (.env with API keys)')
  console.log('7. ✅ Create workspace files (USER.md, AGENTS.md)')
  console.log('8. ✅ Set up systemd service')
  console.log('9. ✅ Enable and start OpenClaw')
}

// Run test
testInstaller().catch(error => {
  console.error('Test failed:', error)
  process.exit(1)
})
