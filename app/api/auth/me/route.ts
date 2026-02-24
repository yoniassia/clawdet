import { NextRequest, NextResponse } from 'next/server'
import { getOptionalAuth } from '@/lib/auth-middleware'
import { findUserById } from '@/lib/db'
import { SECURITY_HEADERS } from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    // Test mode: return mock authenticated user
    if (process.env.TEST_MODE === 'mock') {
      const mockUsername = request.cookies.get('test-username')?.value || 'test-user'
      return NextResponse.json({
        authenticated: true,
        user: {
          userId: 'mock-user-id',
          username: mockUsername,
          name: `Test User ${mockUsername}`,
          profileImage: null,
          email: `${mockUsername}@test.clawdet.com`,
          paid: false,
          provisioningStatus: null,
          instanceUrl: null,
          hetznerVpsIp: null
        }
      }, { headers: SECURITY_HEADERS })
    }

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
        email: fullUser.email,
        paid: fullUser.paid || false,
        provisioningStatus: fullUser.provisioningStatus || null,
        instanceUrl: fullUser.instanceUrl || null,
        hetznerVpsIp: fullUser.hetznerVpsIp || null
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
