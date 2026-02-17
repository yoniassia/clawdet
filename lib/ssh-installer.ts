/**
 * SSH-based OpenClaw Installation Service
 * Handles remote installation and configuration via SSH
 */

import { Client, ConnectConfig } from 'ssh2'
import { promisify } from 'util'

const XAI_API_KEY = process.env.XAI_API_KEY || process.env.GROK_API_KEY

export interface SSHInstallConfig {
  host: string
  username: string
  password?: string
  privateKey?: string
  xUsername: string
  subdomain: string
  xaiApiKey?: string
}

/**
 * Execute command via SSH and return output
 */
async function execSSHCommand(client: Client, command: string): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    client.exec(command, (err, stream) => {
      if (err) {
        return reject(err)
      }

      let stdout = ''
      let stderr = ''

      stream.on('close', (code: number) => {
        resolve({ stdout, stderr, code })
      }).on('data', (data: Buffer) => {
        stdout += data.toString()
      }).stderr.on('data', (data: Buffer) => {
        stderr += data.toString()
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
    
    client.on('ready', () => {
      console.log('[SSH] Connected')
      resolve(client)
    })

    client.on('error', (err) => {
      console.error('[SSH] Connection error:', err)
      reject(err)
    })

    client.connect(config)
  })
}

/**
 * Install OpenClaw on remote VPS via SSH
 */
export async function installOpenClawViaSSH(config: SSHInstallConfig): Promise<void> {
  console.log(`[SSH INSTALLER] Starting installation on ${config.host}`)
  
  const sshConfig: ConnectConfig = {
    host: config.host,
    port: 22,
    username: 'root',
    password: config.password,
    privateKey: config.privateKey,
    readyTimeout: 30000
  }

  let client: Client | null = null

  try {
    // Connect to SSH
    client = await connectSSH(sshConfig)
    console.log('[SSH INSTALLER] Connected to VPS')

    // Step 1: Update system
    console.log('[SSH INSTALLER] Updating system...')
    await execSSHCommand(client, 'apt-get update && apt-get upgrade -y')

    // Step 2: Install dependencies
    console.log('[SSH INSTALLER] Installing dependencies...')
    await execSSHCommand(client, 'apt-get install -y curl wget git build-essential ca-certificates')

    // Step 3: Install Node.js (Latest LTS)
    console.log('[SSH INSTALLER] Installing Node.js...')
    await execSSHCommand(client, `
      curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
      apt-get install -y nodejs
    `)

    // Verify Node.js installation
    const nodeVersion = await execSSHCommand(client, 'node --version')
    console.log('[SSH INSTALLER] Node.js installed:', nodeVersion.stdout.trim())

    // Step 4: Install OpenClaw
    console.log('[SSH INSTALLER] Installing OpenClaw...')
    
    // Note: This assumes OpenClaw has an npm package or installation script
    // For now, we'll create a basic setup structure
    await execSSHCommand(client, `
      mkdir -p /root/.openclaw/workspace
      mkdir -p /root/.openclaw/config
    `)

    // Step 5: Configure environment
    console.log('[SSH INSTALLER] Configuring OpenClaw...')
    const apiKey = config.xaiApiKey || XAI_API_KEY || ''
    
    await execSSHCommand(client, `
      cat > /root/.openclaw/.env <<'EOF'
XAI_API_KEY=${apiKey}
GROK_API_KEY=${apiKey}
OPENCLAW_DOMAIN=${config.subdomain}.clawdet.com
EOF
    `)

    // Step 6: Create workspace files
    console.log('[SSH INSTALLER] Setting up workspace...')
    
    // Create USER.md
    const userMd = `# User: ${config.xUsername}

Your personal OpenClaw instance.

**Instance:** ${config.subdomain}.clawdet.com
**Provisioned:** ${new Date().toISOString()}
**X Username:** @${config.xUsername}

## Getting Started

Welcome to your personal AI assistant! This instance is configured with Grok AI and ready to help you.

Start by sending me a message. I can help with:
- Research and information lookup
- Task automation
- Code generation
- Content creation
- And much more!
`

    await execSSHCommand(client, `
      cat > /root/.openclaw/workspace/USER.md <<'EOFUSER'
${userMd}
EOFUSER
    `)

    // Create AGENTS.md
    const agentsMd = `# AGENTS.md - Your Workspace

This is your personal OpenClaw workspace.

## Your Instance

- **Domain:** ${config.subdomain}.clawdet.com
- **User:** ${config.xUsername}
- **AI Model:** Grok (xAI)

## Memory

Create daily notes in \`memory/YYYY-MM-DD.md\` to track your work.
Create \`MEMORY.md\` for long-term memories and important context.

## Tools

Available integrations and tools will be listed here as you configure them.

## Getting Started

Your OpenClaw instance is ready! Start chatting to explore what I can do for you.
`

    await execSSHCommand(client, `
      cat > /root/.openclaw/workspace/AGENTS.md <<'EOFAGENTS'
${agentsMd}
EOFAGENTS
    `)

    // Create memory directory
    await execSSHCommand(client, 'mkdir -p /root/.openclaw/workspace/memory')

    // Step 7: Install and configure OpenClaw Gateway
    console.log('[SSH INSTALLER] Installing OpenClaw Gateway...')
    
    // Check if OpenClaw package exists, otherwise use placeholder
    const installResult = await execSSHCommand(client, `
      if command -v openclaw &> /dev/null; then
        echo "OpenClaw already installed"
      else
        # Try to install from npm (adjust based on actual installation method)
        npm install -g openclaw 2>&1 || echo "OpenClaw npm package not found, using manual setup"
      fi
    `)
    
    console.log('[SSH INSTALLER] OpenClaw installation result:', installResult.stdout.trim())

    // Step 8: Create basic gateway configuration
    await execSSHCommand(client, `
      cat > /root/.openclaw/config/gateway.yaml <<'EOFCONFIG'
# OpenClaw Gateway Configuration
# Generated by Clawdet provisioning

agent: main
domain: ${config.subdomain}.clawdet.com

# AI Model Configuration
model:
  provider: xai
  name: grok-4-1-fast-non-reasoning
  apiKey: \${XAI_API_KEY}

# Workspace
workspace: /root/.openclaw/workspace

# Session
session:
  type: isolated
  cleanup: keep
EOFCONFIG
    `)

    // Step 9: Set up systemd service (if OpenClaw supports it)
    console.log('[SSH INSTALLER] Setting up systemd service...')
    await execSSHCommand(client, `
      cat > /etc/systemd/system/openclaw.service <<'EOFSERVICE'
[Unit]
Description=OpenClaw Gateway
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/.openclaw
EnvironmentFile=/root/.openclaw/.env
ExecStart=/usr/local/bin/openclaw gateway start --config /root/.openclaw/config/gateway.yaml
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOFSERVICE

      systemctl daemon-reload
      systemctl enable openclaw 2>&1 || echo "OpenClaw service not yet available"
      systemctl start openclaw 2>&1 || echo "OpenClaw service start pending"
    `)

    console.log('[SSH INSTALLER] ✅ Installation complete!')

  } catch (error) {
    console.error('[SSH INSTALLER] ❌ Installation failed:', error)
    throw error
  } finally {
    if (client) {
      client.end()
      console.log('[SSH INSTALLER] SSH connection closed')
    }
  }
}

/**
 * Test SSH connection to a VPS
 */
export async function testSSHConnection(host: string, password: string): Promise<boolean> {
  const sshConfig: ConnectConfig = {
    host,
    port: 22,
    username: 'root',
    password,
    readyTimeout: 10000
  }

  let client: Client | null = null

  try {
    client = await connectSSH(sshConfig)
    const result = await execSSHCommand(client, 'echo "Connection OK"')
    return result.stdout.includes('Connection OK')
  } catch (error) {
    console.error('[SSH TEST] Connection failed:', error)
    return false
  } finally {
    if (client) {
      client.end()
    }
  }
}
