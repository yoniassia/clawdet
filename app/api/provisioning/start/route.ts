/**
 * API: Start Provisioning
 * POST /api/provisioning/start
 * 
 * Triggers VPS provisioning for a user (called by webhook or admin)
 */

import { NextRequest, NextResponse } from 'next/server'
import { startProvisioningJob } from '@/lib/provisioner-v2'
import { findUserById } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    // Verify user exists
    const user = findUserById(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has paid
    if (!user.paid) {
      return NextResponse.json(
        { error: 'User has not completed payment' },
        { status: 400 }
      )
    }

    // Check if already provisioning or complete
    if (user.provisioningStatus === 'complete') {
      return NextResponse.json({
        message: 'Instance already provisioned',
        instanceUrl: user.instanceUrl
      })
    }

    if (user.provisioningStatus && user.provisioningStatus !== 'failed') {
      return NextResponse.json({
        message: 'Provisioning already in progress',
        status: user.provisioningStatus
      })
    }

    // Start provisioning in background
    console.log(`[API] Starting provisioning for user ${userId}`)
    await startProvisioningJob(userId)

    return NextResponse.json({
      message: 'Provisioning started',
      userId,
      status: 'creating_vps'
    })

  } catch (error: any) {
    console.error('[API] Provisioning start error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
