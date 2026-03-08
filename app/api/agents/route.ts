export const dynamic = "force-dynamic"

/**
 * User-facing Agent API
 * Any authenticated user can create/manage their own Docker agents
 * 
 * GET    /api/agents         — list my agents
 * POST   /api/agents         — create new agent
 * PATCH  /api/agents         — start/stop agent
 * DELETE /api/agents?name=x  — remove agent
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { createAgent, stopAgent, startAgent, removeAgent, getAgentStatus, healthCheckAgent } from '@/lib/docker-fleet'
import { findUserById } from '@/lib/sqlite'
import fs from 'fs'
import path from 'path'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''
const FLEET_DIR = process.env.FLEET_DIR || '/root/nanoclaw-fleet'

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

// GET — list my agents
export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req)
  if (authResult instanceof NextResponse) return authResult
  
  try {
    const agentNames = getUserAgents(authResult.id)
    const agents = await Promise.all(agentNames.map(async name => {
      const status = getAgentStatus(name)
      if (!status) return null
      const healthy = status.status === 'running' 
        ? await healthCheckAgent(status.port, status.token) 
        : false
      return {
        name: status.username,
        containerName: status.containerName,
        status: status.status,
        healthy,
        port: status.port,
        memoryMb: status.memoryMb,
        createdAt: status.createdAt,
        // Don't expose full token via list
        tokenPreview: status.token.substring(0, 8) + '...'
      }
    }))

    return NextResponse.json({ 
      agents: agents.filter(Boolean),
      count: agents.filter(Boolean).length
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST — create new agent
export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req)
  if (authResult instanceof NextResponse) return authResult

  try {
    const body = await req.json()
    const { name, personality, model, telegramToken } = body

    if (!name || !/^[a-z0-9-]{2,30}$/.test(name)) {
      return NextResponse.json({ 
        error: 'name required: 2-30 chars, lowercase alphanumeric and hyphens only' 
      }, { status: 400 })
    }

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    // Check user's agent limit (max 5 per user for now)
    const existing = getUserAgents(authResult.id)
    if (existing.length >= 5) {
      return NextResponse.json({ 
        error: 'Agent limit reached (max 5 per user)' 
      }, { status: 429 })
    }

    // Check name isn't taken
    const existingAgent = getAgentStatus(name)
    if (existingAgent && existingAgent.status !== 'not_found') {
      return NextResponse.json({ error: 'Agent name already taken' }, { status: 409 })
    }

    // Build CLAUDE.md from personality or use default
    const user = findUserById(authResult.id)
    const username = user?.x_username || user?.email?.split('@')[0] || authResult.id
    
    const claudeMd = personality || `# AI Agent: ${name}

You are **${name}**, a personal AI agent created by ${username} on Clawdet NanoFleets.

## Personality
- Helpful, direct, resourceful
- Keep responses concise and actionable
- Have opinions and share them

## Owner
- **User:** ${username}
- **Platform:** Clawdet NanoFleets
- **Engine:** NanoClaw
`

    // Create the agent container
    const useTelegram = !!telegramToken
    const agent = createAgent({
      userId: authResult.id,
      username: name,
      anthropicApiKey: ANTHROPIC_API_KEY,
      claudeMd,
      model: model || 'claude-sonnet-4-5'
    })

    // If telegram token provided, recreate with telegram-enabled image
    if (telegramToken) {
      // Write telegram config and restart with telegram image
      const workspaceDir = path.join(FLEET_DIR, 'agents', name)
      
      // Update meta with telegram info
      const metaPath = path.join(workspaceDir, '.agent-meta.json')
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
      meta.telegram = true
      meta.telegramToken = telegramToken
      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), { mode: 0o600 })
    }

    return NextResponse.json({
      success: true,
      agent: {
        name: agent.username,
        containerName: agent.containerName,
        port: agent.port,
        status: 'running',
        token: agent.token, // Full token returned only on creation
        createdAt: agent.createdAt
      },
      chatEndpoint: `http://localhost:${agent.port}/v1/chat/completions`,
      usage: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${agent.token}`
        },
        body: {
          messages: [{ role: 'user', content: 'Hello!' }],
          model: model || 'claude-sonnet-4-5'
        }
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH — start/stop agent
export async function PATCH(req: NextRequest) {
  const authResult = await requireAuth(req)
  if (authResult instanceof NextResponse) return authResult

  try {
    const body = await req.json()
    const { name, action } = body

    if (!name || !['start', 'stop'].includes(action)) {
      return NextResponse.json({ error: 'name and action (start|stop) required' }, { status: 400 })
    }

    // Verify ownership
    const userAgents = getUserAgents(authResult.id)
    if (!userAgents.includes(name)) {
      return NextResponse.json({ error: 'Agent not found or not yours' }, { status: 404 })
    }

    const success = action === 'start' ? startAgent(name) : stopAgent(name)
    return NextResponse.json({ success, action, name })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE — remove agent
export async function DELETE(req: NextRequest) {
  const authResult = await requireAuth(req)
  if (authResult instanceof NextResponse) return authResult

  try {
    const { searchParams } = new URL(req.url)
    const name = searchParams.get('name')

    if (!name) {
      return NextResponse.json({ error: 'name parameter required' }, { status: 400 })
    }

    // Verify ownership
    const userAgents = getUserAgents(authResult.id)
    if (!userAgents.includes(name)) {
      return NextResponse.json({ error: 'Agent not found or not yours' }, { status: 404 })
    }

    removeAgent(name, false) // Keep data by default
    return NextResponse.json({ success: true, name })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
