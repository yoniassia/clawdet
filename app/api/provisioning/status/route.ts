/**
 * API: Get Provisioning Status
 * GET /api/provisioning/status?userId=xxx
 * 
 * Returns current provisioning status for a user
 */

import { NextRequest, NextResponse } from 'next/server'
import { getProvisioningStatus } from '@/lib/provisioner'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    const status = getProvisioningStatus(userId)

    if (!status) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(status)

  } catch (error: any) {
    console.error('[API] Provisioning status error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
