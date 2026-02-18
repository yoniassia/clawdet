import { NextRequest, NextResponse } from 'next/server'
import { getAllUsers } from '@/lib/db'

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'clawdet-admin-2026'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (token !== ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const users = getAllUsers()

    const paidUsers = users.filter(u => u.paid)
    const provisionedInstances = users.filter(u => 
      u.provisioningStatus === 'complete' || u.provisioningStatus === 'installing'
    )
    
    const freeBetaRemaining = 20 - provisionedInstances.length

    const recentUsers = users
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10)
      .map(u => ({
        id: u.id,
        username: u.xUsername,
        createdAt: new Date(u.createdAt).toISOString(),
        paid: u.paid || false,
        provisioningStatus: u.provisioningStatus || 'N/A'
      }))

    return NextResponse.json({
      totalUsers: users.length,
      paidUsers: paidUsers.length,
      provisionedInstances: provisionedInstances.length,
      pendingProvisioning: users.filter(u => u.provisioningStatus === 'pending').length,
      freeBetaRemaining,
      recentUsers
    })

  } catch (error: any) {
    console.error('[ADMIN] Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: error.message },
      { status: 500 }
    )
  }
}
