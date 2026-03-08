export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-middleware'
import { listAgents, getFleetStats, createAgent, stopAgent, startAgent, removeAgent, healthCheckAgent } from '@/lib/docker-fleet'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''

// GET /api/fleet — list all agents + stats
export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req)
  if (authError) return authError

  try {
    const agents = listAgents()
    const stats = getFleetStats()
    
    // Run health checks in parallel
    const agentsWithHealth = await Promise.all(
      agents.map(async (agent) => {
        const healthy = agent.status === 'running' 
          ? await healthCheckAgent(agent.port, agent.token)
          : false
        return { ...agent, healthy, token: agent.token.substring(0, 8) + '...' }
      })
    )

    return NextResponse.json({ agents: agentsWithHealth, stats })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/fleet — create new agent
export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req)
  if (authError) return authError

  try {
    const body = await req.json()
    const { userId, username, claudeMd, model } = body
    
    if (!username) {
      return NextResponse.json({ error: 'username is required' }, { status: 400 })
    }
    
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
    }

    const agent = createAgent({
      userId: userId || `user_${Date.now()}`,
      username,
      anthropicApiKey: ANTHROPIC_API_KEY,
      claudeMd,
      model
    })

    return NextResponse.json({ 
      success: true, 
      agent: { ...agent, token: agent.token.substring(0, 8) + '...' },
      fullToken: agent.token // Only returned on creation
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/fleet — remove agent
export async function DELETE(req: NextRequest) {
  const authError = await requireAdmin(req)
  if (authError) return authError

  try {
    const { searchParams } = new URL(req.url)
    const username = searchParams.get('username')
    const deleteData = searchParams.get('deleteData') === 'true'
    
    if (!username) {
      return NextResponse.json({ error: 'username param required' }, { status: 400 })
    }
    
    removeAgent(username, deleteData)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/fleet — start/stop agent
export async function PATCH(req: NextRequest) {
  const authError = await requireAdmin(req)
  if (authError) return authError

  try {
    const body = await req.json()
    const { username, action } = body
    
    if (!username || !['start', 'stop'].includes(action)) {
      return NextResponse.json({ error: 'username and action (start|stop) required' }, { status: 400 })
    }
    
    const success = action === 'start' ? startAgent(username) : stopAgent(username)
    return NextResponse.json({ success })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
