import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-middleware'
import { getAllUsers } from '@/lib/sqlite'
import { SECURITY_HEADERS } from '@/lib/security'

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const url = new URL(request.url)
  const search = url.searchParams.get('search') || undefined
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const offset = parseInt(url.searchParams.get('offset') || '0')

  const { users, total } = getAllUsers({ search, limit, offset })

  const sanitized = users.map(u => ({
    id: u.id,
    email: u.email,
    username: u.username,
    name: u.name,
    x_username: u.x_username,
    role: u.role,
    paid: !!u.paid,
    provisioning_status: u.provisioning_status,
    instance_url: u.instance_url,
    disabled: !!u.disabled,
    created_at: u.created_at,
    has_password: !!u.password_hash,
    has_x: !!u.x_id,
  }))

  return NextResponse.json({ users: sanitized, total, limit, offset }, { headers: SECURITY_HEADERS })
}
