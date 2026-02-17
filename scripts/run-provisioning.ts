#!/usr/bin/env tsx
/**
 * Run OpenClaw provisioning on a remote VPS
 * Usage: tsx run-provisioning.ts <host> <password> <username> <subdomain>
 */

import { Client } from 'ssh2'
import * as fs from 'fs'
import * as path from 'path'

const XAI_API_KEY = process.env.XAI_API_KEY || process.env.GROK_API_KEY

interface ProvisionConfig {
  host: string
  password: string
  username: string
  subdomain: string
  xaiApiKey: string
}

async function execSSHCommand(
  client: Client,
  command: string,
  streamOutput = true
): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    client.exec(command, (err, stream) => {
      if (err) {
        return reject(err)
      }

      let stdout = ''
      let stderr = ''

      stream
        .on('close', (code: number) => {
          resolve({ stdout, stderr, code })
        })
        .on('data', (data: Buffer) => {
          const text = data.toString()
          stdout += text
          if (streamOutput) {
            process.stdout.write(text)
          }
        })
        .stderr.on('data', (data: Buffer) => {
          const text = data.toString()
          stderr += text
          if (streamOutput) {
            process.stderr.write(text)
          }
        })
    })
  })
}

async function connectSSH(host: string, password: string): Promise<Client> {
  return new Promise((resolve, reject) => {
    const client = new Client()

    const timeout = setTimeout(() => {
      client.end()
      reject(new Error('SSH connection timeout (30s)'))
    }, 30000)

    client
      .on('ready', () => {
        clearTimeout(timeout)
        console.log(`✅ SSH connected to ${host}`)
        resolve(client)
      })
      .on('error', (err) => {
        clearTimeout(timeout)
        console.error(`❌ SSH connection error:`, err.message)
        reject(err)
      })
      .connect({
        host,
        port: 22,
        username: 'root',
        password,
        readyTimeout: 30000,
        algorithms: {
          serverHostKey: ['ssh-rsa', 'ssh-ed25519', 'ecdsa-sha2-nistp256'],
        },
      })
  })
}

async function waitForSSH(
  host: string,
  password: string,
  maxAttempts = 20
): Promise<Client> {
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      console.log(`🔄 Attempting SSH connection (${i}/${maxAttempts})...`)
      const client = await connectSSH(host, password)
      return client
    } catch (error: any) {
      if (i === maxAttempts) {
        throw new Error(
          `SSH connection failed after ${maxAttempts} attempts: ${error.message}`
        )
      }
      console.log(`⏳ SSH not ready, waiting 10 seconds...`)
      await new Promise((resolve) => setTimeout(resolve, 10000))
    }
  }
  throw new Error('SSH connection failed')
}

async function uploadScript(client: Client, scriptPath: string): Promise<string> {
  const scriptContent = fs.readFileSync(scriptPath, 'utf-8')
  const remotePath = '/tmp/provision-openclaw.sh'

  console.log(`📤 Uploading provisioning script...`)

  // Upload via echo and heredoc (works without sftp)
  const uploadCommand = `cat > ${remotePath} << 'EOFSCRIPT'
${scriptContent}
EOFSCRIPT
chmod +x ${remotePath}`

  await execSSHCommand(client, uploadCommand, false)
  console.log(`✅ Script uploaded to ${remotePath}`)

  return remotePath
}

async function provisionInstance(config: ProvisionConfig): Promise<void> {
  console.log('🚀 Starting OpenClaw provisioning...')
  console.log(`   Host: ${config.host}`)
  console.log(`   User: ${config.username}`)
  console.log(`   Domain: ${config.subdomain}.clawdet.com`)
  console.log('')

  let client: Client | null = null

  try {
    // Wait for SSH to be available
    client = await waitForSSH(config.host, config.password)

    // Upload provisioning script
    const scriptPath = path.join(__dirname, 'provision-openclaw.sh')
    const remotePath = await uploadScript(client, scriptPath)

    // Run provisioning script
    console.log('')
    console.log('🔧 Running provisioning script...')
    console.log('─'.repeat(60))

    const env = `XAI_API_KEY='${config.xaiApiKey}' USERNAME='${config.username}' SUBDOMAIN='${config.subdomain}'`
    const command = `${env} bash ${remotePath}`

    const result = await execSSHCommand(client, command, true)

    console.log('─'.repeat(60))

    if (result.code === 0) {
      console.log('')
      console.log('✅ Provisioning completed successfully!')
      console.log('')
      console.log('🌐 Instance URL: https://' + config.subdomain + '.clawdet.com')
      console.log('🔌 Gateway: https://' + config.subdomain + '.clawdet.com:18789')
      console.log('')
    } else {
      throw new Error(`Provisioning script failed with exit code ${result.code}`)
    }
  } catch (error: any) {
    console.error('')
    console.error('❌ Provisioning failed:', error.message)
    throw error
  } finally {
    if (client) {
      client.end()
      console.log('🔌 SSH connection closed')
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)

  if (args.length < 4) {
    console.error('Usage: tsx run-provisioning.ts <host> <password> <username> <subdomain>')
    console.error('')
    console.error('Example:')
    console.error('  tsx run-provisioning.ts 65.109.132.127 MyPassword123 yoniassia test-user')
    process.exit(1)
  }

  const [host, password, username, subdomain] = args

  if (!XAI_API_KEY) {
    console.error('❌ XAI_API_KEY or GROK_API_KEY environment variable is required')
    process.exit(1)
  }

  const config: ProvisionConfig = {
    host,
    password,
    username,
    subdomain,
    xaiApiKey: XAI_API_KEY,
  }

  try {
    await provisionInstance(config)
    console.log('✅ Done!')
    process.exit(0)
  } catch (error: any) {
    console.error('💥 Fatal error:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { provisionInstance, ProvisionConfig }
