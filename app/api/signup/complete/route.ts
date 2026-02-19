import { NextRequest, NextResponse } from 'next/server'
import { updateUser } from '@/lib/db'
import { requireAuth } from '@/lib/auth-middleware'
import { SECURITY_HEADERS } from '@/lib/security'
import { logDetailsSubmit } from '@/lib/onboarding-logger'

export async function POST(request: NextRequest) {
  let userId: string = 'unknown'
  
  try {
    // Verify authentication
    const user = requireAuth(request)
    if (user instanceof NextResponse) {
      return user // Return auth error
    }
    
    userId = user.id
    
    // Get form data
    const { email, termsAccepted } = await request.json()
    
    if (!email || !termsAccepted) {
      return NextResponse.json(
        { error: 'Email and terms acceptance required' },
        { status: 400 }
      )
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }
    
    // Update user in database
    const updatedUser = updateUser(user.id, {
      email,
      termsAccepted
    })
    
    if (!updatedUser) {
      logDetailsSubmit(false, user.id, email, 'User not found in database')
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: SECURITY_HEADERS }
      )
    }
    
    // Log successful details submission
    logDetailsSubmit(true, updatedUser.id, updatedUser.email!)
    
    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        termsAccepted: updatedUser.termsAccepted
      }
    }, { headers: SECURITY_HEADERS })
  } catch (error) {
    console.error('Signup complete error:', error)
    logDetailsSubmit(false, userId, 'unknown', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}
