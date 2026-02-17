/**
 * Hetzner Cloud API Service
 * Handles VPS provisioning with mock and real modes
 */

const HETZNER_API_URL = 'https://api.hetzner.cloud/v1'
const HETZNER_API_TOKEN = process.env.HETZNER_API_TOKEN
const MOCK_MODE = !HETZNER_API_TOKEN || process.env.HETZNER_MOCK_MODE === 'true'

export interface HetznerServer {
  id: number
  name: string
  status: string
  public_net: {
    ipv4: {
      ip: string
    }
    ipv6: {
      ip: string
    }
  }
  server_type: {
    name: string
    description: string
  }
  datacenter: {
    name: string
    location: {
      name: string
      city: string
      country: string
    }
  }
  created: string
}

export interface CreateServerRequest {
  name: string
  server_type: string
  image: string
  location?: string
  ssh_keys?: number[]
  user_data?: string
  labels?: Record<string, string>
}

export interface CreateServerResponse {
  server: HetznerServer
  action: {
    id: number
    status: string
    command: string
  }
  root_password?: string
}

/**
 * Create a new VPS server
 */
export async function createServer(request: CreateServerRequest): Promise<CreateServerResponse> {
  if (MOCK_MODE) {
    console.log('[HETZNER MOCK] Creating server:', request)
    
    // Mock response simulating a real Hetzner server
    const mockServerId = Math.floor(Math.random() * 100000000)
    const mockIp = `${Math.floor(Math.random() * 200) + 50}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
    
    return {
      server: {
        id: mockServerId,
        name: request.name,
        status: 'initializing',
        public_net: {
          ipv4: {
            ip: mockIp
          },
          ipv6: {
            ip: '2001:db8::1'
          }
        },
        server_type: {
          name: request.server_type,
          description: 'CX11 - 1 vCPU, 2GB RAM'
        },
        datacenter: {
          name: 'fsn1-dc14',
          location: {
            name: 'fsn1',
            city: 'Falkenstein',
            country: 'DE'
          }
        },
        created: new Date().toISOString()
      },
      action: {
        id: Math.floor(Math.random() * 100000000),
        status: 'running',
        command: 'create_server'
      },
      root_password: 'MockPassword123!'
    }
  }

  // Real Hetzner API call
  const response = await fetch(`${HETZNER_API_URL}/servers`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HETZNER_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Hetzner API error: ${response.status} - ${error}`)
  }

  return await response.json()
}

/**
 * Get server details
 */
export async function getServer(serverId: number): Promise<HetznerServer> {
  if (MOCK_MODE) {
    console.log('[HETZNER MOCK] Getting server:', serverId)
    
    return {
      id: serverId,
      name: `mock-server-${serverId}`,
      status: 'running',
      public_net: {
        ipv4: {
          ip: '192.0.2.1'
        },
        ipv6: {
          ip: '2001:db8::1'
        }
      },
      server_type: {
        name: 'cx11',
        description: 'CX11 - 1 vCPU, 2GB RAM'
      },
      datacenter: {
        name: 'fsn1-dc14',
        location: {
          name: 'fsn1',
          city: 'Falkenstein',
          country: 'DE'
        }
      },
      created: new Date().toISOString()
    }
  }

  const response = await fetch(`${HETZNER_API_URL}/servers/${serverId}`, {
    headers: {
      'Authorization': `Bearer ${HETZNER_API_TOKEN}`
    }
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Hetzner API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data.server
}

/**
 * Wait for server to be running
 */
export async function waitForServer(serverId: number, maxWaitMs: number = 120000): Promise<HetznerServer> {
  const startTime = Date.now()
  
  while (Date.now() - startTime < maxWaitMs) {
    const server = await getServer(serverId)
    
    if (server.status === 'running') {
      return server
    }
    
    if (server.status === 'error' || server.status === 'failed') {
      throw new Error(`Server ${serverId} failed to start: ${server.status}`)
    }
    
    // Wait 5 seconds before checking again
    await new Promise(resolve => setTimeout(resolve, 5000))
  }
  
  throw new Error(`Server ${serverId} did not start within ${maxWaitMs}ms`)
}

/**
 * Delete a server
 */
export async function deleteServer(serverId: number): Promise<void> {
  if (MOCK_MODE) {
    console.log('[HETZNER MOCK] Deleting server:', serverId)
    return
  }

  const response = await fetch(`${HETZNER_API_URL}/servers/${serverId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${HETZNER_API_TOKEN}`
    }
  })

  if (!response.ok && response.status !== 404) {
    const error = await response.text()
    throw new Error(`Hetzner API error: ${response.status} - ${error}`)
  }
}

/**
 * Generate cloud-init user data for OpenClaw installation
 */
export function generateCloudInit(config: {
  xaiApiKey: string
  username: string
  subdomain: string
}): string {
  return `#!/bin/bash
set -e

# Update system
apt-get update
apt-get upgrade -y

# Install dependencies
apt-get install -y curl wget git build-essential

# Install Node.js (latest LTS)
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt-get install -y nodejs

# Install OpenClaw
# TODO: Replace with actual OpenClaw installation command
curl -fsSL https://openclaw.com/install.sh | bash || echo "OpenClaw install script not yet available"

# Create workspace directory
mkdir -p /root/.openclaw/workspace

# Configure OpenClaw with Grok API
cat > /root/.openclaw/.env <<EOF
XAI_API_KEY=${config.xaiApiKey}
GROK_API_KEY=${config.xaiApiKey}
EOF

# Create initial workspace files
cat > /root/.openclaw/workspace/USER.md <<EOF
# User: ${config.username}

Your personal OpenClaw instance.

Instance: ${config.subdomain}.clawdet.com
Provisioned: $(date)
EOF

cat > /root/.openclaw/workspace/AGENTS.md <<EOF
# Welcome to Your OpenClaw Instance!

This is your personal AI assistant powered by Grok.

## Getting Started

1. Send me a message to start chatting
2. Ask me to help with tasks
3. Configure integrations in the settings

Your instance URL: https://${config.subdomain}.clawdet.com
EOF

# Start OpenClaw
# TODO: Replace with actual OpenClaw start command
# systemctl enable openclaw
# systemctl start openclaw

echo "OpenClaw installation complete!"
`
}
