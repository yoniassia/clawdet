import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { auth } from '@/lib/auth'
import { findUserById, updateUserById } from '@/lib/sqlite'
import { SECURITY_HEADERS } from '@/lib/security'

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: SECURITY_HEADERS })

  const user = findUserById(session.user.id)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404, headers: SECURITY_HEADERS })

  const body = await request.json()
  const updates: Record<string, unknown> = {}

  if (body.name !== undefined) updates.name = body.name
  if (body.email !== undefined) updates.email = body.email.toLowerCase()

  // Password change
  if (body.newPassword) {
    if (!body.currentPassword) return NextResponse.json({ error: 'Current password required' }, { status: 400, headers: SECURITY_HEADERS })
    if (!user.password_hash) return NextResponse.json({ error: 'No password set. Use a different method.' }, { status: 400, headers: SECURITY_HEADERS })
    const valid = await bcrypt.compare(body.currentPassword, user.password_hash)
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400, headers: SECURITY_HEADERS })
    if (body.newPassword.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400, headers: SECURITY_HEADERS })
    updates.password_hash = await bcrypt.hash(body.newPassword, 12)
  }

  updateUserById(user.id, updates as any)
  return NextResponse.json({ success: true }, { headers: SECURITY_HEADERS })
}
