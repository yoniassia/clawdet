/**
 * Docker Fleet Manager
 * Manages NanoClaw agent containers for each user
 */
import { execSync, exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const FLEET_DIR = process.env.FLEET_DIR || '/root/nanoclaw-fleet'
const DOCKER_IMAGE = 'nanoclaw-agent'
const PORT_RANGE_START = 18810
const PORT_RANGE_END = 18899
const HOST_IP = process.env.HOST_IP || '188.34.197.212'

export interface AgentContainer {
  containerId: string
  containerName: string
  userId: string
  username: string
  port: number
  token: string
  status: 'running' | 'stopped' | 'error' | 'not_found'
  memoryMb?: number
  uptime?: string
  instanceUrl?: string
  createdAt?: string
}

export interface FleetStats {
  totalAgents: number
  runningAgents: number
  stoppedAgents: number
  totalMemoryMb: number
  availableSlots: number
}

function run(cmd: string, timeout = 10000): string {
  try {
    return execSync(cmd, { timeout, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim()
  } catch (e: any) {
    return e.stdout?.toString().trim() || ''
  }
}

function ensureImage(): boolean {
  const exists = run(`docker images -q ${DOCKER_IMAGE} 2>/dev/null`)
  return exists.length > 0
}

function findAvailablePort(): number {
  const usedPorts = new Set<number>()
  const output = run('docker ps --format "{{.Ports}}" 2>/dev/null')
  const portRegex = /0\.0\.0\.0:(\d+)/g
  let match
  while ((match = portRegex.exec(output)) !== null) {
    usedPorts.add(parseInt(match[1]))
  }
  
  for (let port = PORT_RANGE_START; port <= PORT_RANGE_END; port++) {
    if (!usedPorts.has(port)) return port
  }
  throw new Error('No available ports in fleet range')
}

function containerName(username: string): string {
  const safe = username.toLowerCase().replace(/[^a-z0-9-]/g, '-').substring(0, 30)
  return `nano-${safe}`
}

/**
 * Create and start a new agent container for a user
 */
export function createAgent(opts: {
  userId: string
  username: string
  anthropicApiKey: string
  claudeMd?: string
  model?: string
}): AgentContainer {
  const { userId, username, anthropicApiKey, model } = opts
  const name = containerName(username)
  const port = findAvailablePort()
  const token = crypto.randomBytes(32).toString('hex')
  
  // Create workspace
  const workspaceDir = path.join(FLEET_DIR, 'agents', username)
  const memoryDir = path.join(workspaceDir, 'memory')
  const knowledgeDir = path.join(workspaceDir, 'knowledge')
  const publicDir = path.join(workspaceDir, 'public')
  fs.mkdirSync(memoryDir, { recursive: true })
  fs.mkdirSync(knowledgeDir, { recursive: true })
  fs.mkdirSync(publicDir, { recursive: true })
  
  // Write CLAUDE.md
  const claudeMd = opts.claudeMd || `# Your AI Assistant

You are a personal AI assistant for **${username}**.

## Who You Are
- Helpful, direct, and resourceful
- Skip performative helpfulness — just help
- Have opinions and share them
- Be concise when needed, thorough when it matters

## Your Instance
- **User:** ${username}
- **Platform:** Clawdet
- **Engine:** NanoClaw

## 🧠 Memory System

You have persistent memory across conversations. USE IT.

### File Structure
- **MEMORY.md** — Long-term memory (curated essentials about your user)
- **memory/YYYY-MM-DD.md** — Daily logs (what happened each day)
- **knowledge/** — Reference docs, research, saved info
- **public/** — WebClaw published files (your website)

### Every Conversation
1. Read MEMORY.md first — it's your long-term memory
2. Check today's daily log if it exists
3. Use what you learn to personalize responses

### When to Write
- User says "remember this" → MEMORY.md or daily log
- Learn something about user (name, preferences) → MEMORY.md
- Significant conversation → daily log
- Research material → knowledge/ directory

### Be Proactive
If a user mentions their name, job, interests — save it without being asked.
That's what makes you *their* AI, not just *an* AI.

## 🛠️ Your Full Skill Set

You have 14 tools available. Here's what each does and when to use it:

### Core Tools
- **\`bash\`** — Run any shell command. You have bash, curl, wget, git, python3, jq available.
- **\`read_file\`** — Read a file from your workspace.
- **\`write_file\`** — Write/create a file in your workspace.
- **\`list_files\`** — List files and directories.

### 🔍 Search & Research
- **\`web_search\`** — Search the web (general). Use for any question that needs current info.
- **\`web_search_brave\`** — Search via Brave API. More privacy-focused, good for technical queries.
- **\`news_briefing\`** — Get latest news headlines. Use when asked about current events, news, or "what's happening."

### 🎨 Creative
- **\`generate_image\`** — Generate images with DALL-E 3. Use when asked to create, draw, design, or visualize anything. Returns an image URL.

### 📅 Productivity
- **\`daily_planner\`** — Create and manage daily plans, schedules, and task lists. Use when asked about planning, scheduling, or organizing a day.

### 🧠 Memory
- **\`memory_save\`** — Save important info to persistent memory. Use when told "remember this" or when you learn something worth keeping.
- **\`memory_recall\`** — Search your saved memories. Check this when asked about past conversations or preferences.

### 🌐 WebClaw (Website Publishing)
- **\`webclaw_deploy\`** — Publish a file to your live website. Instantly available at \`https://YOUR-SUBDOMAIN.clawdet.com/site/PATH\`.
- **\`webclaw_status\`** — Check your site: files, sizes, quota usage, live URL.
- **\`webclaw_delete\`** — Remove a file or clear your entire site (\`path: "all"\`).

### 💡 When to Use What
| User says... | Use this tool |
|---|---|
| "What's the weather/news?" | \`news_briefing\` or \`web_search\` |
| "Search for..." / "Look up..." | \`web_search\` or \`web_search_brave\` |
| "Draw me..." / "Generate an image of..." | \`generate_image\` |
| "Build me a website" / "Create a page" | \`webclaw_deploy\` (just do it!) |
| "Remember that..." / "Save this..." | \`memory_save\` |
| "What did I tell you about...?" | \`memory_recall\` |
| "Plan my day" / "Schedule..." | \`daily_planner\` |
| "Run this command" / "Install..." | \`bash\` |

### ⚡ Pro Tips
- **Don't ask for permission** to use tools — if you know which tool fits, just use it.
- **Chain tools** — search the web, then generate an image based on results, then deploy as a website.
- **Always try** before saying you can't. You have bash — almost anything is possible.
- **WebClaw sites are instant** — no DNS, no SSL, no config needed. Just \`webclaw_deploy\` and share the link.
- **Web search is free** — don't say "I don't have access to real-time data." You DO. Search for it.

`
  
  fs.writeFileSync(path.join(workspaceDir, 'CLAUDE.md'), claudeMd)
  
  if (!fs.existsSync(path.join(workspaceDir, 'MEMORY.md'))) {
    fs.writeFileSync(path.join(workspaceDir, 'MEMORY.md'), `# Long-Term Memory\n\n**User:** ${username}\n**Created:** ${new Date().toISOString().split('T')[0]}\n`)
  }
  
  // Save token
  fs.writeFileSync(path.join(workspaceDir, '.gateway-token'), token, { mode: 0o600 })
  
  // Save metadata
  fs.writeFileSync(path.join(workspaceDir, '.agent-meta.json'), JSON.stringify({
    userId, username, port, token, name,
    model: model || 'claude-sonnet-4-5',
    createdAt: new Date().toISOString()
  }, null, 2), { mode: 0o600 })
  
  // Remove existing container if any
  run(`docker rm -f ${name} 2>/dev/null`)
  
  // Start container
  const result = run(`docker run -d \
    --name ${name} \
    --restart unless-stopped \
    --memory=128m \
    --cpus=0.25 \
    -p ${port}:18789 \
    -e PORT=18789 \
    -e GATEWAY_TOKEN="${token}" \
    -e ANTHROPIC_API_KEY="${anthropicApiKey}" \
    -e AI_MODEL="${model || 'claude-sonnet-4-5'}" \
    -e WORKSPACE_DIR=/workspace \
    -v ${workspaceDir}:/workspace \
    -l "clawdet.fleet=true" \
    -l "clawdet.user=${username}" \
    -l "clawdet.userId=${userId}" \
    -e AGENT_SUBDOMAIN="${username.toLowerCase().replace(/[^a-z0-9-]/g, '-')}" \
    ${DOCKER_IMAGE}`)
  
  if (!result || result.includes('Error')) {
    throw new Error(`Failed to create container: ${result}`)
  }
  
  return {
    containerId: result.substring(0, 12),
    containerName: name,
    userId,
    username,
    port,
    token,
    status: 'running',
    instanceUrl: `https://${username.toLowerCase().replace(/[^a-z0-9-]/g, '-')}.clawdet.com`,
    createdAt: new Date().toISOString()
  }
}

/**
 * Stop an agent container
 */
export function stopAgent(username: string): boolean {
  const name = containerName(username)
  const result = run(`docker stop ${name} 2>/dev/null`)
  return !result.includes('Error')
}

/**
 * Start a stopped agent container
 */
export function startAgent(username: string): boolean {
  const name = containerName(username)
  const result = run(`docker start ${name} 2>/dev/null`)
  return !result.includes('Error')
}

/**
 * Remove an agent container and optionally its data
 */
export function removeAgent(username: string, deleteData = false): boolean {
  const name = containerName(username)
  run(`docker rm -f ${name} 2>/dev/null`)
  
  if (deleteData) {
    const workspaceDir = path.join(FLEET_DIR, 'agents', username)
    if (fs.existsSync(workspaceDir)) {
      fs.rmSync(workspaceDir, { recursive: true })
    }
  }
  return true
}

/**
 * Get status of a specific agent
 */
export function getAgentStatus(username: string): AgentContainer | null {
  const name = containerName(username)
  const workspaceDir = path.join(FLEET_DIR, 'agents', username)
  
  // Read metadata
  const metaPath = path.join(workspaceDir, '.agent-meta.json')
  if (!fs.existsSync(metaPath)) return null
  
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
  
  // Check Docker status
  const info = run(`docker inspect --format '{{.State.Status}}|{{.State.StartedAt}}' ${name} 2>/dev/null`)
  
  if (!info || info.includes('Error')) {
    return {
      containerId: '',
      containerName: name,
      userId: meta.userId,
      username: meta.username,
      port: meta.port,
      token: meta.token,
      status: 'not_found',
      createdAt: meta.createdAt
    }
  }
  
  const [status, startedAt] = info.split('|')
  
  // Get memory
  const stats = run(`docker stats --no-stream --format '{{.MemUsage}}' ${name} 2>/dev/null`)
  const memMatch = stats.match(/([\d.]+)MiB/)
  
  // Get container ID
  const cid = run(`docker inspect --format '{{.Id}}' ${name} 2>/dev/null`)
  
  return {
    containerId: cid.substring(0, 12),
    containerName: name,
    userId: meta.userId,
    username: meta.username,
    port: meta.port,
    token: meta.token,
    status: status === 'running' ? 'running' : 'stopped',
    memoryMb: memMatch ? parseFloat(memMatch[1]) : undefined,
    uptime: startedAt,
    instanceUrl: meta.instanceUrl,
    createdAt: meta.createdAt
  }
}

/**
 * List all fleet agents
 */
export function listAgents(): AgentContainer[] {
  const agents: AgentContainer[] = []
  const agentsDir = path.join(FLEET_DIR, 'agents')
  
  if (!fs.existsSync(agentsDir)) return agents
  
  const dirs = fs.readdirSync(agentsDir)
  for (const dir of dirs) {
    const metaPath = path.join(agentsDir, dir, '.agent-meta.json')
    if (!fs.existsSync(metaPath)) continue
    
    try {
      const agent = getAgentStatus(dir)
      if (agent) agents.push(agent)
    } catch (e) {
      // Skip broken agents
    }
  }
  
  return agents
}

/**
 * Get fleet statistics
 */
export function getFleetStats(): FleetStats {
  const agents = listAgents()
  const running = agents.filter(a => a.status === 'running')
  const totalMem = running.reduce((sum, a) => sum + (a.memoryMb || 32), 0)
  
  return {
    totalAgents: agents.length,
    runningAgents: running.length,
    stoppedAgents: agents.filter(a => a.status === 'stopped').length,
    totalMemoryMb: Math.round(totalMem),
    availableSlots: PORT_RANGE_END - PORT_RANGE_START - agents.length
  }
}

/**
 * Health check an agent's HTTP endpoint
 */
export async function healthCheckAgent(port: number, token: string): Promise<boolean> {
  try {
    const resp = await fetch(`http://localhost:${port}/health`, {
      headers: { 'Authorization': `Bearer ${token}` },
      signal: AbortSignal.timeout(5000)
    })
    return resp.ok
  } catch {
    return false
  }
}

/**
 * Send a test chat message to verify agent is working
 */
export async function testAgentChat(port: number, token: string): Promise<string | null> {
  try {
    const resp = await fetch(`http://localhost:${port}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'ping' }],
        model: 'claude-sonnet-4-5'
      }),
      signal: AbortSignal.timeout(15000)
    })
    if (!resp.ok) return null
    const data = await resp.json() as any
    return data.choices?.[0]?.message?.content || null
  } catch {
    return null
  }
}
