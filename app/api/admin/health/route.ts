import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { checkAllInstances, getProvisionedInstances } from '@/lib/instance-health'
import { findUserById } from '@/lib/sqlite'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = findUserById(session.user.id)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const report = await checkAllInstances()
    return NextResponse.json(report)
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({ error: 'Health check failed' }, { status: 500 })
  }
}
