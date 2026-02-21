import { NextRequest, NextResponse } from 'next/server'
import { updateUser, getUserCount } from '@/lib/db'
import { requireAuth } from '@/lib/auth-middleware'
import { SECURITY_HEADERS } from '@/lib/security'
import { logDetailsSubmit } from '@/lib/onboarding-logger'

export async function POST(request: NextRequest) {
  let userId: string = 'unknown'
  
  try {
    console.log('[Signup Complete] Request received')
    
    // Verify authentication
    const user = requireAuth(request)
    if (user instanceof NextResponse) {
      console.error('[Signup Complete] Auth failed')
      return user // Return auth error
    }
    
    userId = user.id
    console.log('[Signup Complete] User authenticated:', userId)
    
    // Get form data
    const { email, termsAccepted } = await request.json()
    console.log('[Signup Complete] Form data:', { email, termsAccepted })
    
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
    
    // Update user in database - mark as paid (free tier during beta)
    const updatedUser = updateUser(session.userId, {
      email,
      termsAccepted,
      paid: true,
      paymentMethod: 'free_beta',
      paidAt: new Date().toISOString()
    })
    
    if (!updatedUser) {
      console.error('[Signup Complete] User not found in database')
      logDetailsSubmit(false, user.id, email, 'User not found in database')
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: SECURITY_HEADERS }
      )
    }
    
    console.log('[Signup Complete] User marked as free beta:', {
      id: updatedUser.id,
      email: updatedUser.email,
      paid: true
    })
    
    return NextResponse.json({
      success: true,
      freeBeta: isFreeBeta,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        termsAccepted: updatedUser.termsAccepted,
        paid: true
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
