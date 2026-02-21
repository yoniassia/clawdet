import { NextRequest, NextResponse } from 'next/server'
import { getOptionalAuth } from '@/lib/auth-middleware'
import { SECURITY_HEADERS } from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    const authResult = getOptionalAuth(request)
    
    if (!authResult) {
      return NextResponse.json({ 
        authenticated: false,
        user: null 
      }, { headers: SECURITY_HEADERS })
    }
    
    // Get full user from database
    const { findUserById } = await import('@/lib/db')
    const user = findUserById(authResult.id)
    
    if (!user) {
      return NextResponse.json({ 
        authenticated: false,
        user: null 
      }, { headers: SECURITY_HEADERS })
    }
    
    return NextResponse.json({ 
      authenticated: true,
      user: {
        userId: user.id,
        username: user.xUsername || user.email?.split('@')[0] || user.id,
        name: user.xName || user.name || 'User',
        profileImage: user.xProfileImage,
        email: user.email
      }
    }, { headers: SECURITY_HEADERS })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ 
      authenticated: false,
      user: null 
    }, { headers: SECURITY_HEADERS })
  }
}
