import { NextRequest, NextResponse } from 'next/server'
import { getOptionalAuth } from '@/lib/auth-middleware'
import { SECURITY_HEADERS } from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    const user = getOptionalAuth(request)
    
    if (!user) {
      return NextResponse.json({ user: null }, { headers: SECURITY_HEADERS })
    }
    
    return NextResponse.json({ 
      user: {
        id: user.id,
        xUsername: user.xUsername,
        email: user.email
      }
    }, { headers: SECURITY_HEADERS })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ user: null }, { headers: SECURITY_HEADERS })
  }
}
