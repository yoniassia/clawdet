/**
 * Authentication middleware for protecting API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { findUserBySessionToken } from '@/lib/db'
import { SECURITY_HEADERS } from '@/lib/security'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    xUsername: string
    email: string
    sessionToken: string
  }
}

/**
 * Verify session cookie and return user if authenticated
 */
export function getAuthenticatedUser(request: NextRequest) {
  const sessionToken = request.cookies.get('user_session')?.value

  if (!sessionToken) {
    return null
  }

  const user = findUserBySessionToken(sessionToken)
  
  // Check if session is expired (7 days)
  if (user && user.sessionToken === sessionToken) {
    const sessionAge = Date.now() - (user.sessionCreatedAt || 0)
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000
    
    if (sessionAge > SEVEN_DAYS) {
      console.log('Session expired for user:', user.xUsername)
      return null
    }
    
    return {
      id: user.id,
      xUsername: user.xUsername,
      email: user.email,
      sessionToken: user.sessionToken
    }
  }

  return null
}

/**
 * Require authentication - returns 401 if not authenticated
 * Usage in API route:
 * 
 * export async function GET(request: NextRequest) {
 *   const user = requireAuth(request)
 *   if (user instanceof NextResponse) return user // Error response
 *   // ... continue with authenticated user
 * }
 */
export function requireAuth(request: NextRequest) {
  const user = getAuthenticatedUser(request)
  
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { 
        status: 401,
        headers: SECURITY_HEADERS
      }
    )
  }
  
  return user
}

/**
 * Verify that the requesting user is authorized to access a resource
 */
export function requireOwnership(
  authenticatedUserId: string,
  resourceUserId: string
): NextResponse | null {
  if (authenticatedUserId !== resourceUserId) {
    return NextResponse.json(
      { error: 'Unauthorized access to resource' },
      { 
        status: 403,
        headers: SECURITY_HEADERS
      }
    )
  }
  
  return null
}

/**
 * Optional auth - returns user if authenticated, null otherwise (no error)
 */
export function getOptionalAuth(request: NextRequest) {
  return getAuthenticatedUser(request)
}
