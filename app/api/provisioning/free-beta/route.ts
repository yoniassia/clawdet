/**
 * Free Beta Provisioning - First 20 Users
 * Skips payment, provisions directly
 */

import { NextRequest, NextResponse } from 'next/server'
import { startProvisioningJob } from '@/lib/provisioner-v2'
import { updateUser, findUserById, getAllUsers } from '@/lib/db'
import { requireAuth } from '@/lib/auth-middleware'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = requireAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult // Return error response
    }

    const userId = authResult.id

    // Get user
    const user = findUserById(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if already provisioned or in progress
    if (user.paid || user.provisioningStatus === 'complete') {
      return NextResponse.json({
        success: true,
        message: 'Instance already provisioned',
        status: user.provisioningStatus
      })
    }

    // Count total instances (free beta limit: 20)
    const allUsers = getAllUsers()
    const provisionedCount = allUsers.filter(u => 
      u.paid || u.provisioningStatus === 'complete' || u.provisioningStatus === 'installing'
    ).length

    const FREE_BETA_LIMIT = 20

    if (provisionedCount >= FREE_BETA_LIMIT) {
      return NextResponse.json(
        { 
          error: 'Free beta spots full',
          message: `Sorry! All ${FREE_BETA_LIMIT} free beta spots are taken. Regular pricing ($20/month) will be available soon.`,
          provisionedCount,
          limit: FREE_BETA_LIMIT
        },
        { status: 429 }
      )
    }

    // Mark user as "paid" (free beta)
    updateUser(userId, {
      paid: true,
      paidAt: new Date().toISOString(),
      paymentMethod: 'free-beta',
      provisioningStatus: 'pending'
    })

    console.log(`[FREE BETA] Starting provisioning for ${user.xUsername} (${provisionedCount + 1}/${FREE_BETA_LIMIT})`)

    // Start provisioning in background
    startProvisioningJob(userId)

    return NextResponse.json({
      success: true,
      message: 'Provisioning started!',
      instanceNumber: provisionedCount + 1,
      totalLimit: FREE_BETA_LIMIT,
      remainingSpots: FREE_BETA_LIMIT - provisionedCount - 1
    })

  } catch (error: any) {
    console.error('[FREE BETA] Error:', error)
    return NextResponse.json(
      { error: 'Failed to start provisioning', details: error.message },
      { status: 500 }
    )
  }
}
