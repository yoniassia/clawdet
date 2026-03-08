/**
 * Authentication middleware for protecting API routes
 * 
 * Supports:
 *  1. Auth.js v5 session (via auth() from lib/auth.ts)
 *  2. Legacy user_session cookie (backward compat)
 */

import { NextRequest, NextResponse } from 'next/server'
import { findUserBySessionToken, findUserById } from '@/lib/sqlite'
import { auth } from '@/lib/auth'
import { SECURITY_HEADERS } from '@/lib/security'

export interface AuthResult {
  id: string
  xUsername: string
  email: string
  sessionToken: string
}

/**
 * Try to extract user from Auth.js session
 */
async function getAuthJsUser(): Promise<AuthResult | null> {
  try {
    const session = await auth()
    if (!session?.user?.id && !session?.user?.email) return null

    const userId = (session.user as any).id || session.user.email
    if (!userId) return null

    // Look up full user in our database
    const user = findUserById(userId)
    if (!user) return null

    return {
      id: user.id,
      xUsername: user.x_username || user.username || '',
      email: user.email || '',
      sessionToken: 'authjs',
    }
  } catch {
    return null
  }
}

/**
 * Try to extract user from legacy user_session cookie
 */
function getLegacySessionUser(request: NextRequest): AuthResult | null {
  const sessionToken = request.cookies.get('user_session')?.value
  if (!sessionToken) return null

  const user = findUserBySessionToken(sessionToken)
  if (!user || user.session_token !== sessionToken) return null

  const sessionAge = Date.now() - (user.session_created_at || 0)
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000
  if (sessionAge > SEVEN_DAYS) return null

  return {
    id: user.id,
    xUsername: user.x_username || user.username || '',
    email: user.email || '',
    sessionToken,
  }
}

/**
 * Get authenticated user (tries all auth methods)
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthResult | null> {
  // 1. Try Auth.js session (encrypted JWE cookie)
  const authJsUser = await getAuthJsUser()
  if (authJsUser) return authJsUser

  // 2. Try legacy cookie
  return getLegacySessionUser(request)
}

/**
 * Require authentication - returns 401 if not authenticated
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult | NextResponse> {
  // Test mode bypass
  if (process.env.TEST_MODE === 'mock') {
    const mockUsername = request.cookies.get('test-username')?.value || 'test-user'
    return {
      id: 'mock-user-id',
      xUsername: mockUsername,
      email: `${mockUsername}@test.clawdet.com`,
      sessionToken: 'mock-session-token',
    }
  }

  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401, headers: SECURITY_HEADERS }
    )
  }
  return user
}

/**
 * Require admin role
 */
export async function requireAdmin(request: NextRequest): Promise<AuthResult | NextResponse> {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const user = findUserById(auth.id)
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403, headers: SECURITY_HEADERS }
    )
  }
  return auth
}

/**
 * Optional auth — returns user if authenticated, null otherwise
 */
export async function getOptionalAuth(request: NextRequest): Promise<AuthResult | null> {
  return getAuthenticatedUser(request)
}

/**
 * Verify ownership — checks if authenticated user matches target userId
 * Returns NextResponse error if mismatch, null if OK
 */
export function requireOwnership(authenticatedUserId: string, targetUserId: string): NextResponse | null {
  if (authenticatedUserId !== targetUserId) {
    // Allow admins to view anyone's status
    const user = findUserById(authenticatedUserId)
    if (user?.role === 'admin') return null
    
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403, headers: SECURITY_HEADERS }
    )
  }
  return null
}
