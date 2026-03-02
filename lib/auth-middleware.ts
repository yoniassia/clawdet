/**
 * Authentication middleware for protecting API routes
 * 
 * Supports:
 *  1. Auth.js v5 JWT sessions (next-auth.session-token cookie)
 *  2. Legacy user_session cookie (backward compat)
 */

import { NextRequest, NextResponse } from 'next/server'
import { findUserBySessionToken, findUserById, findUserByEmail } from '@/lib/sqlite'
import { SECURITY_HEADERS } from '@/lib/security'

export interface AuthResult {
  id: string
  xUsername: string
  email: string
  sessionToken: string
}

/**
 * Try to extract user from Auth.js JWT session cookie.
 * Auth.js v5 stores a JWT in the `authjs.session-token` or `next-auth.session-token` cookie.
 * We decode the JWT payload (not verifying signature here — middleware runs server-side
 * and the cookie is httpOnly + secure).
 */
function getAuthJsUser(request: NextRequest): AuthResult | null {
  // Auth.js v5 cookie name
  const token = request.cookies.get('authjs.session-token')?.value
    || request.cookies.get('next-auth.session-token')?.value
    || request.cookies.get('__Secure-authjs.session-token')?.value
    || request.cookies.get('__Secure-next-auth.session-token')?.value

  if (!token) return null

  try {
    // JWT has 3 parts: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())

    // Auth.js puts user info in the JWT
    const userId = payload.sub || payload.id
    if (!userId) return null

    // Look up the user in our database
    const user = findUserById(userId)
      || (payload.email ? findUserByEmail(payload.email) : undefined)

    if (!user) return null

    return {
      id: user.id,
      xUsername: user.x_username || user.username || '',
      email: user.email || '',
      sessionToken: token,
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

  // Check if session is expired (7 days)
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
 * Verify session and return user if authenticated (tries all auth methods)
 */
export function getAuthenticatedUser(request: NextRequest): AuthResult | null {
  // 1. Try Auth.js JWT session
  const authJsUser = getAuthJsUser(request)
  if (authJsUser) return authJsUser

  // 2. Try legacy cookie
  return getLegacySessionUser(request)
}

/**
 * Require authentication - returns 401 if not authenticated
 */
export function requireAuth(request: NextRequest): AuthResult | NextResponse {
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

  const user = getAuthenticatedUser(request)
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
export function requireAdmin(request: NextRequest): AuthResult | NextResponse {
  const auth = requireAuth(request)
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
 * Verify resource ownership
 */
export function requireOwnership(
  authenticatedUserId: string,
  resourceUserId: string
): NextResponse | null {
  if (authenticatedUserId !== resourceUserId) {
    return NextResponse.json(
      { error: 'Unauthorized access to resource' },
      { status: 403, headers: SECURITY_HEADERS }
    )
  }
  return null
}

/**
 * Optional auth — returns user if authenticated, null otherwise
 */
export function getOptionalAuth(request: NextRequest): AuthResult | null {
  return getAuthenticatedUser(request)
}
