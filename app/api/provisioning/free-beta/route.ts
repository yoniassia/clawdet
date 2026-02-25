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
    // Test mode bypass — no real DB user exists
    if (process.env.TEST_MODE === 'mock') {
      return NextResponse.json({ success: true, instanceNumber: 1, totalLimit: 20 })
    }

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
      // Coolify-based provisioning — inline to avoid .js import issues with webpack
      const subdomain = username.toLowerCase().replace(/[^a-z0-9-]/g, '-')
      const baseDomain = process.env.CLAWDET_DOMAIN ?? 'clawdet.com'
      const fqdn = `https://${subdomain}.${baseDomain}`
      const coolifyBaseUrl = process.env.COOLIFY_BASE_URL
      const coolifyToken = process.env.COOLIFY_API_TOKEN
      const serverUuid = process.env.COOLIFY_SERVER_UUID
      const projectUuid = process.env.COOLIFY_PROJECT_UUID

      if (!coolifyBaseUrl || !coolifyToken || !serverUuid || !projectUuid) {
        console.warn('[FREE BETA] Coolify env vars not set, falling back to Hetzner')
        const { startProvisioningJob } = await import('@/lib/provisioner-v2')
        startProvisioningJob(userId)
      } else {
        // Start Coolify provisioning in background
        const provisionPromise = (async () => {
          const apiUrl = `${coolifyBaseUrl.replace(/\/$/, '')}/api/v1`
          const headers = {
            'Authorization': `Bearer ${coolifyToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }

          // 1. Create Docker image application
          const createRes = await fetch(`${apiUrl}/applications/dockerimage`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              server_uuid: serverUuid,
              project_uuid: projectUuid,
              environment_name: 'production',
              docker_registry_image_name: 'openclaw/openclaw',
              docker_registry_image_tag: 'latest',
              name: `openclaw-${subdomain}`,
              description: `Clawdet tenant: ${subdomain}`,
              domains: fqdn,
              instant_deploy: false,
            }),
          })
          if (!createRes.ok) throw new Error(`Coolify create failed: ${createRes.status}`)
          const app = await createRes.json()

          // 2. Set env vars
          const envVars = [
            { key: 'OPENCLAW_TENANT_ID', value: userId },
            { key: 'OPENCLAW_MODEL', value: process.env.DEFAULT_MODEL ?? 'anthropic/claude-sonnet-4-20250514' },
            { key: 'OPENCLAW_CHANNELS', value: 'web' },
          ]
          await fetch(`${apiUrl}/applications/${app.uuid}/envs/bulk`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(envVars),
          })

          // 3. Deploy
          await fetch(`${apiUrl}/applications/${app.uuid}/start`, {
            method: 'POST',
            headers,
          })

          return { appUuid: app.uuid, url: fqdn, status: 'provisioned' as const }
        })()

        provisionPromise.then(result => {
          updateUser(userId, {
            provisioningStatus: 'complete',
            provisioningStep: 8,
            provisioningProgress: 100,
            provisioningMessage: 'Your instance is ready!',
            instanceUrl: result.url,
            coolifyAppUuid: result.appUuid,
          })
          console.log(`[FREE BETA] ✅ Coolify provisioning complete: ${result.url}`)
        }).catch(err => {
          updateUser(userId, {
            provisioningStatus: 'failed',
            provisioningMessage: err.message || 'Provisioning failed',
          })
          console.error(`[FREE BETA] ❌ Coolify provisioning error:`, err)
        })
      }
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
