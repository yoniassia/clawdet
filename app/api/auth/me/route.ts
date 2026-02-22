import { NextRequest, NextResponse } from 'next/server'
import { getOptionalAuth } from '@/lib/auth-middleware'
import { findUserById } from '@/lib/db'
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
    
    // Get full user details from database
    const fullUser = findUserById(authResult.id)
    
    if (!fullUser) {
      return NextResponse.json({ 
        authenticated: false,
        user: null 
      }, { headers: SECURITY_HEADERS })
    }
    
    return NextResponse.json({ 
      authenticated: true,
      user: {
        userId: fullUser.id,
        username: fullUser.xUsername || fullUser.email?.split('@')[0] || fullUser.id,
        name: fullUser.xName || fullUser.name || 'User',
        profileImage: fullUser.xProfileImage,
        email: fullUser.email
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
