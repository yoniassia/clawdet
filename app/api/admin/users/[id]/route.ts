import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-middleware'
import { findUserById, updateUserById, deleteUserById } from '@/lib/sqlite'
import { SECURITY_HEADERS } from '@/lib/security'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const { id } = await params
  const user = findUserById(id)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404, headers: SECURITY_HEADERS })

  const { password_hash, session_token, session_created_at, ...safe } = user
  return NextResponse.json({ user: { ...safe, has_password: !!password_hash } }, { headers: SECURITY_HEADERS })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const { id } = await params
  const body = await request.json()

  // Only allow specific fields to be updated
  const allowed: Record<string, unknown> = {}
  if (body.role !== undefined) allowed.role = body.role
  if (body.paid !== undefined) allowed.paid = body.paid ? 1 : 0
  if (body.disabled !== undefined) allowed.disabled = body.disabled ? 1 : 0
  if (body.provisioning_status !== undefined) allowed.provisioning_status = body.provisioning_status

  const user = updateUserById(id, allowed as any)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404, headers: SECURITY_HEADERS })

  return NextResponse.json({ success: true }, { headers: SECURITY_HEADERS })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const { id } = await params
  const deleted = deleteUserById(id)
  if (!deleted) return NextResponse.json({ error: 'User not found' }, { status: 404, headers: SECURITY_HEADERS })

  return NextResponse.json({ success: true }, { headers: SECURITY_HEADERS })
}
