/**
 * SSH-based OpenClaw Installation Service V2
 * Uses proven bash script + SSH key authentication
 */

import { Client, ConnectConfig } from 'ssh2'
import * as fs from 'fs'
import * as path from 'path'

export interface SSHInstallConfig {
  host: string
  sshKeyPath?: string
  password?: string
  xUsername: string
  subdomain: string
  xaiApiKey: string
}

interface SSHCommandResult {
  stdout: string
  stderr: string
  code: number
}

/**
 * Execute command via SSH and return output
 */
async function execSSHCommand(
  client: Client,
  command: string,
  streamOutput = false
): Promise<SSHCommandResult> {
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

/**
 * Connect to SSH server
 */
async function connectSSH(config: ConnectConfig): Promise<Client> {
  return new Promise((resolve, reject) => {
    const client = new Client()

    const timeout = setTimeout(() => {
      client.end()
      reject(new Error('SSH connection timeout (30s)'))
    }, 30000)

    client
      .on('ready', () => {
        clearTimeout(timeout)
        console.log(`[SSH] Connected to ${config.host}`)
        resolve(client)
      })
      .on('error', (err) => {
        clearTimeout(timeout)
        console.error(`[SSH] Connection error:`, err.message)
        reject(err)
      })
      .connect(config)
  })
}

/**
 * Wait for SSH to become available
 */
async function waitForSSH(
  host: string,
  sshKeyPath?: string,
  password?: string,
  maxAttempts = 20
): Promise<Client> {
  const sshConfig: ConnectConfig = {
    host,
    port: 22,
    username: 'root',
    readyTimeout: 15000,
    algorithms: {
      serverHostKey: ['ssh-rsa', 'ssh-ed25519', 'ecdsa-sha2-nistp256'],
    },
  }

  if (sshKeyPath) {
    sshConfig.privateKey = fs.readFileSync(sshKeyPath)
  } else if (password) {
    sshConfig.password = password
  } else {
    throw new Error('Either sshKeyPath or password must be provided')
  }

  for (let i = 1; i <= maxAttempts; i++) {
    try {
      console.log(`[SSH] Attempting connection (${i}/${maxAttempts})...`)
      const client = await connectSSH(sshConfig)
      return client
    } catch (error: any) {
      if (i === maxAttempts) {
        throw new Error(
          `SSH connection failed after ${maxAttempts} attempts: ${error.message}`
        )
      }
      console.log(`[SSH] Not ready, waiting 10 seconds...`)
      await new Promise((resolve) => setTimeout(resolve, 10000))
    }
  }
  throw new Error('SSH connection failed')
}

/**
 * Upload provisioning script via SSH
 */
async function uploadScript(client: Client, scriptPath: string): Promise<string> {
  const scriptContent = fs.readFileSync(scriptPath, 'utf-8')
  const remotePath = '/tmp/provision-openclaw.sh'

  console.log(`[SSH] Uploading provisioning script (${scriptPath})...`)

  // Upload via heredoc (works without sftp)
  const uploadCommand = `cat > ${remotePath} << 'EOFSCRIPT'
${scriptContent}
EOFSCRIPT
chmod +x ${remotePath}`

  const result = await execSSHCommand(client, uploadCommand, false)
  if (result.code !== 0) {
    throw new Error(`Failed to upload script: ${result.stderr}`)
  }

  console.log(`[SSH] Script uploaded to ${remotePath}`)
  return remotePath
}

/**
 * Install OpenClaw on remote VPS via SSH using the proven bash script
 */
export async function installOpenClawViaSSH(config: SSHInstallConfig): Promise<void> {
  console.log(`[PROVISIONER] Starting OpenClaw installation on ${config.host}`)
  console.log(`[PROVISIONER] User: ${config.xUsername}`)
  console.log(`[PROVISIONER] Domain: ${config.subdomain}.clawdet.com`)

  let client: Client | null = null

  try {
    // Wait for SSH to be available
    console.log(`[PROVISIONER] Waiting for SSH access...`)
    client = await waitForSSH(config.host, config.sshKeyPath, config.password)

    // Upload provisioning script
    const scriptPath = path.join(__dirname, '..', 'scripts', 'provision-openclaw.sh')
    
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Provisioning script not found: ${scriptPath}`)
    }

    const remotePath = await uploadScript(client, scriptPath)

    // Run provisioning script
    console.log(`[PROVISIONER] Running provisioning script...`)
    console.log('─'.repeat(60))

    const env = `XAI_API_KEY='${config.xaiApiKey}' USERNAME='${config.xUsername}' SUBDOMAIN='${config.subdomain}'`
    const command = `${env} bash ${remotePath}`

    const result = await execSSHCommand(client, command, true)

    console.log('─'.repeat(60))

    if (result.code === 0) {
      console.log(`[PROVISIONER] ✅ Installation completed successfully!`)
      console.log(`[PROVISIONER] Instance URL: https://${config.subdomain}.clawdet.com`)
      console.log(`[PROVISIONER] Gateway: https://${config.subdomain}.clawdet.com:18789`)
    } else {
      throw new Error(`Provisioning script failed with exit code ${result.code}\n${result.stderr}`)
    }
  } catch (error: any) {
    console.error(`[PROVISIONER] ❌ Installation failed:`, error.message)
    throw error
  } finally {
    if (client) {
      client.end()
      console.log(`[PROVISIONER] SSH connection closed`)
    }
  }
}

/**
 * Test SSH connection to a VPS
 */
export async function testSSHConnection(
  host: string,
  sshKeyPath?: string,
  password?: string
): Promise<boolean> {
  const sshConfig: ConnectConfig = {
    host,
    port: 22,
    username: 'root',
    readyTimeout: 10000,
  }

  if (sshKeyPath) {
    sshConfig.privateKey = fs.readFileSync(sshKeyPath)
  } else if (password) {
    sshConfig.password = password
  } else {
    return false
  }

  let client: Client | null = null

  try {
    client = await connectSSH(sshConfig)
    const result = await execSSHCommand(client, 'echo "SSH_OK"', false)
    return result.stdout.includes('SSH_OK')
  } catch (error) {
    console.error('[SSH] Connection test failed:', error)
    return false
  } finally {
    if (client) {
      client.end()
    }
  }
}
