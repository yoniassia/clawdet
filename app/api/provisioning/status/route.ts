/**
 * API: Get Provisioning Status
 * GET /api/provisioning/status?userId=xxx
 * 
 * Returns current provisioning status for a user
 * Requires authentication and ownership verification
 */

import { NextRequest, NextResponse } from 'next/server'
import { getProvisioningStatus } from '@/lib/provisioner'
import { requireAuth, requireOwnership } from '@/lib/auth-middleware'
import { SECURITY_HEADERS } from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const authenticatedUser = requireAuth(request)
    if (authenticatedUser instanceof NextResponse) {
      return authenticatedUser // Return 401 error
    }

    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    // Verify ownership: user can only access their own provisioning status
    const ownershipError = requireOwnership(authenticatedUser.id, userId)
    if (ownershipError) {
      return ownershipError // Return 403 error
    }

    const status = getProvisioningStatus(userId)

    if (!status) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: SECURITY_HEADERS }
      )
    }

    return NextResponse.json(status, { headers: SECURITY_HEADERS })

  } catch (error: any) {
    console.error('[API] Provisioning status error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}
