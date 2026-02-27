import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAccountsByUserId } from '@/lib/sqlite'
import { SECURITY_HEADERS } from '@/lib/security'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: SECURITY_HEADERS })
  const accounts = getAccountsByUserId(session.user.id)
  return NextResponse.json({ accounts }, { headers: SECURITY_HEADERS })
}
