import { NextRequest, NextResponse } from 'next/server'
import { getOptionalAuth } from '@/lib/auth-middleware'
import { findUserById } from '@/lib/db'
import { SECURITY_HEADERS } from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    const authUser = getOptionalAuth(request)
    
    if (!authUser) {
      return NextResponse.json({ 
        authenticated: false,
        user: null 
      }, { headers: SECURITY_HEADERS })
    }

    // Get full user details from database
    const user = findUserById(authUser.id)
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
        username: user.xUsername,
        name: user.xName || user.xUsername,
        email: user.email,
        profileImage: user.xProfileImage
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
