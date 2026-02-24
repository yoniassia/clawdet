/**
 * API: Get Provisioning Status
 * GET /api/provisioning/status?userId=xxx
 * 
 * Returns current provisioning status for a user.
 * Supports both Coolify and legacy Hetzner provisioners.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getProvisioningStatus, STEPS } from '@/lib/provisioner-v2'
import { requireAuth, requireOwnership } from '@/lib/auth-middleware'
import { SECURITY_HEADERS } from '@/lib/security'
import { findUserById } from '@/lib/db'

const PROVISIONER = process.env.PROVISIONER ?? 'coolify'


export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const authenticatedUser = requireAuth(request)
    if (authenticatedUser instanceof NextResponse) {
      return authenticatedUser
    }

    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    // Verify ownership
    const ownershipError = requireOwnership(authenticatedUser.id, userId)
    if (ownershipError) {
      return ownershipError
    }

    // If using Coolify and we have an app UUID, try to get live status
    if (PROVISIONER === 'coolify') {
      const user = findUserById(userId)
      if (user?.coolifyAppUuid && user.provisioningStatus !== 'complete' && user.provisioningStatus !== 'failed') {
        try {
          const coolifyBaseUrl = process.env.COOLIFY_BASE_URL!.replace(/\/$/, '')
          const res = await fetch(`${coolifyBaseUrl}/api/v1/applications/${user.coolifyAppUuid}`, {
            headers: {
              'Authorization': `Bearer ${process.env.COOLIFY_API_TOKEN}`,
              'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(10_000),
          })
          if (!res.ok) throw new Error(`Coolify API ${res.status}`)
          const app = await res.json() as { status?: string; fqdn?: string }
          
          // Map Coolify status to our status shape
          if (app.status === 'running') {
            return NextResponse.json({
              status: 'complete',
              step: 8,
              totalSteps: 8,
              stepName: 'Complete',
              progress: 100,
              message: 'Your instance is ready!',
              instanceUrl: user.instanceUrl || app.fqdn,
              logs: user.provisioningLogs || [],
              steps: STEPS,
            }, { headers: SECURITY_HEADERS })
          }
        } catch (err) {
          // Fall through to DB-based status
          console.warn('[STATUS] Coolify query failed, using DB status:', err)
        }
      }
    }

    // Fall back to DB-based status (works for both provisioners)
    const status = getProvisioningStatus(userId)

    if (!status) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: SECURITY_HEADERS }
      )
    }

    return NextResponse.json({ ...status, steps: STEPS }, { headers: SECURITY_HEADERS })

  } catch (error: any) {
    console.error('[API] Provisioning status error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}
