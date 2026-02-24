/**
 * Free Beta Provisioning - First 20 Users
 * Skips payment, provisions directly
 * 
 * Supports two provisioners via PROVISIONER env var:
 *   - "coolify" (default) — Uses Coolify API
 *   - "hetzner" — Legacy Hetzner VPS provisioner
 */

import { NextRequest, NextResponse } from 'next/server'
import { updateUser, findUserById, getAllUsers, getUserCount } from '@/lib/db'
import { requireAuth } from '@/lib/auth-middleware'

const FREE_BETA_LIMIT = 20
const PROVISIONER = process.env.PROVISIONER ?? 'coolify'

/**
 * GET - Check free beta eligibility
 */
export async function GET(request: NextRequest) {
  try {
    const totalUsers = getUserCount()
    const eligible = totalUsers <= FREE_BETA_LIMIT
    
    return NextResponse.json({
      eligible,
      totalUsers,
      limit: FREE_BETA_LIMIT,
      spotsRemaining: Math.max(0, FREE_BETA_LIMIT - totalUsers)
    })
  } catch (error: any) {
    console.error('[FREE BETA] Check error:', error)
    return NextResponse.json(
      { error: 'Failed to check eligibility', eligible: false },
      { status: 500 }
    )
  }
}

/**
 * POST - Start free beta provisioning
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = requireAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult
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

    // Check if already fully provisioned
    if (user.provisioningStatus === 'complete' && user.instanceUrl) {
      return NextResponse.json({
        success: true,
        message: 'Instance already provisioned',
        status: user.provisioningStatus,
        instanceUrl: user.instanceUrl
      })
    }

    // If provisioning is actively in progress, don't restart
    if (user.provisioningStatus && !['failed', 'complete', 'pending'].includes(user.provisioningStatus) && user.provisioningStatus !== null) {
      return NextResponse.json({
        success: true,
        message: 'Provisioning already in progress',
        status: user.provisioningStatus
      })
    }

    // Count total instances (free beta limit: 20)
    const allUsers = getAllUsers()
    const provisionedCount = allUsers.filter(u => 
      u.paid || u.provisioningStatus === 'complete' || u.provisioningStatus === 'installing'
    ).length

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

    const username = user.xUsername || user.email?.split('@')[0] || user.id
    console.log(`[FREE BETA] Starting ${PROVISIONER} provisioning for ${username} (${provisionedCount + 1}/${FREE_BETA_LIMIT})`)

    if (PROVISIONER === 'coolify') {
      // Coolify-based provisioning
      const { provisionTenant } = await import('@/scripts/coolify/provision-tenant')
      
      const subdomain = username.toLowerCase().replace(/[^a-z0-9-]/g, '-')
      
      // Start Coolify provisioning in background
      const provisionPromise = provisionTenant({
        id: userId,
        subdomain,
        channels: ['web'],
        model: process.env.DEFAULT_MODEL ?? 'anthropic/claude-sonnet-4-20250514',
        apiKeys: {},
      })

      // Don't await — let it run in background
      provisionPromise.then(result => {
        if (result.status === 'provisioned') {
          updateUser(userId, {
            provisioningStatus: 'complete',
            provisioningStep: 8,
            provisioningProgress: 100,
            provisioningMessage: 'Your instance is ready!',
            instanceUrl: result.url,
            coolifyAppUuid: result.appUuid,
          })
          console.log(`[FREE BETA] ✅ Coolify provisioning complete: ${result.url}`)
        } else {
          updateUser(userId, {
            provisioningStatus: 'failed',
            provisioningMessage: result.error || 'Provisioning failed',
          })
          console.error(`[FREE BETA] ❌ Coolify provisioning failed: ${result.error}`)
        }
      }).catch(err => {
        updateUser(userId, {
          provisioningStatus: 'failed',
          provisioningMessage: err.message || 'Provisioning failed',
        })
        console.error(`[FREE BETA] ❌ Coolify provisioning error:`, err)
      })
    } else {
      // Legacy Hetzner provisioner
      const { startProvisioningJob } = await import('@/lib/provisioner-v2')
      startProvisioningJob(userId)
    }

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
