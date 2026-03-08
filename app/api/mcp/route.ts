export const dynamic = "force-dynamic"

/**
 * MCP (Model Context Protocol) Server
 * Exposes agent management as MCP tools
 * 
 * Supports JSON-RPC over HTTP (Streamable HTTP transport)
 * Compatible with Claude Desktop, Cursor, Windsurf, etc.
 * 
 * Endpoint: POST /api/mcp
 * Auth: Bearer token (user's session token or API key)
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { createAgent, stopAgent, startAgent, removeAgent, getAgentStatus, healthCheckAgent, listAgents, getFleetStats } from '@/lib/docker-fleet'
import { findUserById } from '@/lib/sqlite'
import fs from 'fs'
import path from 'path'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''
const FLEET_DIR = process.env.FLEET_DIR || '/root/nanoclaw-fleet'
const MCP_SERVER_NAME = 'clawdet-nanofleets'
const MCP_VERSION = '1.0.0'

function getUserAgents(userId: string): string[] {
  const agentsDir = path.join(FLEET_DIR, 'agents')
  if (!fs.existsSync(agentsDir)) return []
  return fs.readdirSync(agentsDir).filter(dir => {
    const metaPath = path.join(agentsDir, dir, '.agent-meta.json')
    if (!fs.existsSync(metaPath)) return false
    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
      return meta.userId === userId
    } catch { return false }
  })
}

// MCP Tool definitions
const TOOLS = [
  {
    name: 'create_agent',
    description: 'Create a new AI agent Docker container. Each agent gets its own personality (CLAUDE.md), memory, and chat endpoint.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Agent name (2-30 chars, lowercase alphanumeric and hyphens). Must be unique.' },
        personality: { type: 'string', description: 'Custom CLAUDE.md content defining the agent\'s personality, role, and behavior. If omitted, a default is generated.' },
        model: { type: 'string', description: 'AI model to use (default: claude-sonnet-4-5)', enum: ['claude-sonnet-4-5', 'claude-opus-4-6', 'claude-haiku-3-5'] }
      },
      required: ['name']
    }
  },
  {
    name: 'list_agents',
    description: 'List all your AI agents with their status, health, and resource usage.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'get_agent',
    description: 'Get detailed status of a specific agent including health, memory usage, and configuration.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Agent name to inspect' }
      },
      required: ['name']
    }
  },
  {
    name: 'start_agent',
    description: 'Start a stopped agent container.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Agent name to start' }
      },
      required: ['name']
    }
  },
  {
    name: 'stop_agent',
    description: 'Stop a running agent container. The agent\'s data and configuration are preserved.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Agent name to stop' }
      },
      required: ['name']
    }
  },
  {
    name: 'remove_agent',
    description: 'Remove an agent container. The agent\'s workspace data is preserved by default.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Agent name to remove' },
        delete_data: { type: 'boolean', description: 'Also delete the agent\'s workspace data (default: false)' }
      },
      required: ['name']
    }
  },
  {
    name: 'chat_with_agent',
    description: 'Send a message to one of your agents and get a response.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Agent name to chat with' },
        message: { type: 'string', description: 'Message to send to the agent' }
      },
      required: ['name', 'message']
    }
  },
  {
    name: 'fleet_stats',
    description: 'Get fleet-wide statistics: total agents, running agents, memory usage, available slots.',
    inputSchema: { type: 'object', properties: {} }
  }
]

async function handleToolCall(toolName: string, args: any, userId: string): Promise<any> {
  const userAgents = getUserAgents(userId)
  const user = findUserById(userId)
  const username = user?.x_username || user?.email?.split('@')[0] || userId

  switch (toolName) {
    case 'create_agent': {
      const { name, personality, model } = args
      if (!name || !/^[a-z0-9-]{2,30}$/.test(name)) {
        return { error: 'name: 2-30 chars, lowercase alphanumeric and hyphens' }
      }
      if (userAgents.length >= 5) {
        return { error: 'Agent limit reached (max 5 per user)' }
      }
      const existing = getAgentStatus(name)
      if (existing && existing.status !== 'not_found') {
        return { error: 'Agent name already taken' }
      }
      
      const claudeMd = personality || `# AI Agent: ${name}\n\nYou are **${name}**, created by ${username} on Clawdet NanoFleets.\n\n## Personality\n- Helpful, direct, resourceful\n- Concise and actionable\n`
      
      const agent = createAgent({
        userId,
        username: name,
        anthropicApiKey: ANTHROPIC_API_KEY,
        claudeMd,
        model: model || 'claude-sonnet-4-5'
      })
      
      return {
        created: true,
        name: agent.username,
        port: agent.port,
        token: agent.token,
        chatEndpoint: `POST http://localhost:${agent.port}/v1/chat/completions`,
        healthEndpoint: `GET http://localhost:${agent.port}/health`
      }
    }

    case 'list_agents': {
      const agents = await Promise.all(userAgents.map(async name => {
        const status = getAgentStatus(name)
        if (!status) return null
        const healthy = status.status === 'running' 
          ? await healthCheckAgent(status.port, status.token) 
          : false
        return { name, status: status.status, healthy, port: status.port, memoryMb: status.memoryMb }
      }))
      return { agents: agents.filter(Boolean), count: agents.filter(Boolean).length }
    }

    case 'get_agent': {
      const { name } = args
      if (!userAgents.includes(name)) return { error: 'Agent not found or not yours' }
      const status = getAgentStatus(name)
      if (!status) return { error: 'Agent not found' }
      const healthy = status.status === 'running' 
        ? await healthCheckAgent(status.port, status.token) 
        : false
      
      // Read CLAUDE.md
      let claudeMd = ''
      try {
        claudeMd = fs.readFileSync(path.join(FLEET_DIR, 'agents', name, 'CLAUDE.md'), 'utf8')
      } catch {}
      
      return { ...status, healthy, claudeMd, token: status.token.substring(0, 8) + '...' }
    }

    case 'start_agent': {
      if (!userAgents.includes(args.name)) return { error: 'Agent not found or not yours' }
      return { success: startAgent(args.name), name: args.name }
    }

    case 'stop_agent': {
      if (!userAgents.includes(args.name)) return { error: 'Agent not found or not yours' }
      return { success: stopAgent(args.name), name: args.name }
    }

    case 'remove_agent': {
      if (!userAgents.includes(args.name)) return { error: 'Agent not found or not yours' }
      removeAgent(args.name, args.delete_data || false)
      return { removed: true, name: args.name, dataDeleted: args.delete_data || false }
    }

    case 'chat_with_agent': {
      if (!userAgents.includes(args.name)) return { error: 'Agent not found or not yours' }
      const status = getAgentStatus(args.name)
      if (!status || status.status !== 'running') return { error: 'Agent is not running' }
      
      try {
        const resp = await fetch(`http://localhost:${status.port}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${status.token}`
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: args.message }]
          }),
          signal: AbortSignal.timeout(30000)
        })
        const data = await resp.json() as any
        return { response: data.choices?.[0]?.message?.content || 'No response' }
      } catch (e: any) {
        return { error: `Chat failed: ${e.message}` }
      }
    }

    case 'fleet_stats': {
      return getFleetStats()
    }

    default:
      return { error: `Unknown tool: ${toolName}` }
  }
}

// MCP JSON-RPC handler
export async function POST(req: NextRequest) {
  // Auth
  const authResult = await requireAuth(req)
  if (authResult instanceof NextResponse) return authResult
  const userId = authResult.id

  try {
    const rpc = await req.json()
    const { id, method, params } = rpc

    let result: any

    switch (method) {
      case 'initialize':
        result = {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: MCP_SERVER_NAME, version: MCP_VERSION }
        }
        break

      case 'tools/list':
        result = { tools: TOOLS }
        break

      case 'tools/call': {
        const { name: toolName, arguments: toolArgs } = params || {}
        const toolResult = await handleToolCall(toolName, toolArgs || {}, userId)
        result = {
          content: [{
            type: 'text',
            text: JSON.stringify(toolResult, null, 2)
          }]
        }
        break
      }

      case 'ping':
        result = {}
        break

      default:
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Method not found: ${method}` }
        })
    }

    return NextResponse.json({ jsonrpc: '2.0', id, result })
  } catch (error: any) {
    return NextResponse.json({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32603, message: error.message }
    })
  }
}

// GET — MCP server discovery / info
export async function GET(req: NextRequest) {
  return NextResponse.json({
    name: MCP_SERVER_NAME,
    version: MCP_VERSION,
    protocol: 'mcp',
    protocolVersion: '2024-11-05',
    description: 'Clawdet NanoFleets — Create and manage AI agent fleets via MCP',
    tools: TOOLS.map(t => ({ name: t.name, description: t.description })),
    endpoints: {
      mcp: 'POST /api/mcp',
      rest: {
        list: 'GET /api/agents',
        create: 'POST /api/agents',
        control: 'PATCH /api/agents',
        remove: 'DELETE /api/agents?name=xxx'
      }
    },
    auth: 'Bearer token (session cookie or API key)',
    docs: 'https://clawdet.com/nanofleets'
  })
}
