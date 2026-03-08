export const dynamic = "force-dynamic"
/**
 * GET /api/agents/token?subdomain=xxx
 * 
 * Returns the gateway token for a user's agent — only if the
 * authenticated user owns that agent. Used by the chat UI on
 * {username}.clawdet.com to gate access.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getOptionalAuth } from '@/lib/auth-middleware'
import { findUserById } from '@/lib/sqlite'
import fs from 'fs'
import path from 'path'

const FLEET_DIR = process.env.FLEET_DIR || '/root/nanoclaw-fleet'

// Allow CORS from *.clawdet.com subdomains
function corsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Cookie',
    'Access-Control-Allow-Credentials': 'true',
  }
  if (origin && /^https:\/\/[a-z0-9-]+\.clawdet\.com$/.test(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
  }
  return headers
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin')
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) })
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get('origin')
  const headers = corsHeaders(origin)

  try {
    const subdomain = req.nextUrl.searchParams.get('subdomain')
    if (!subdomain) {
      return NextResponse.json({ error: 'subdomain required' }, { status: 400, headers })
    }

    // Check auth
    const authResult = await getOptionalAuth(req)
    if (!authResult) {
      return NextResponse.json({ error: 'not_authenticated', login: 'https://clawdet.com/login' }, { status: 401, headers })
    }

    // Find user's agent directory
    const agentDir = path.join(FLEET_DIR, 'agents', subdomain)
    const metaPath = path.join(agentDir, '.agent-meta.json')
    
    if (!fs.existsSync(metaPath)) {
      return NextResponse.json({ error: 'agent_not_found' }, { status: 404, headers })
    }

    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'))

    // Verify ownership
    if (meta.userId !== authResult.id) {
      // Check if admin
      const user = findUserById(authResult.id)
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'not_owner' }, { status: 403, headers })
      }
    }

    // Return token
    const tokenPath = path.join(agentDir, '.gateway-token')
    const token = fs.readFileSync(tokenPath, 'utf8').trim()

    return NextResponse.json({ 
      token,
      subdomain,
      owner: true
    }, { headers })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers })
  }
}
