export const dynamic = "force-dynamic"
/**
 * API: Get Provisioning Status
 * GET /api/provisioning/status?userId=xxx
 * 
 * Returns current provisioning status for Docker-based NanoClaw agents.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireOwnership } from '@/lib/auth-middleware'
import { SECURITY_HEADERS } from '@/lib/security'
import { findUserById } from '@/lib/sqlite'

const DOCKER_STEPS = [
  { name: 'Validation', icon: '🔍', description: 'Validating configuration...' },
  { name: 'Container Setup', icon: '🐳', description: 'Creating your AI container...' },
  { name: 'DNS Configuration', icon: '🌐', description: 'Setting up your domain...' },
  { name: 'Health Check', icon: '✅', description: 'Verifying your agent is live...' },
]

export async function GET(request: NextRequest) {
  try {
    const authenticatedUser = await requireAuth(request)
    if (authenticatedUser instanceof NextResponse) return authenticatedUser

    const userId = request.nextUrl.searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400, headers: SECURITY_HEADERS })
    }

    const ownershipError = requireOwnership(authenticatedUser.id, userId)
    if (ownershipError) return ownershipError

    const user = findUserById(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404, headers: SECURITY_HEADERS })
    }

    // Parse logs
    let logs: any[] = []
    try {
      logs = user.provisioning_logs ? JSON.parse(user.provisioning_logs) : []
    } catch { logs = [] }

    const step = user.provisioning_step ?? 0
    const status = user.provisioning_status || 'pending'
    const progress = user.provisioning_progress ?? 0

    return NextResponse.json({
      status,
      step,
      totalSteps: DOCKER_STEPS.length,
      stepName: user.provisioning_step_name || DOCKER_STEPS[step]?.name || 'Pending',
      progress,
      message: user.provisioning_message || DOCKER_STEPS[step]?.description || 'Starting...',
      instanceUrl: user.instance_url || null,
      logs,
      steps: DOCKER_STEPS,
    }, { headers: SECURITY_HEADERS })

  } catch (error: any) {
    console.error('[API] Provisioning status error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}
