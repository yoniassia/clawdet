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
    
    // Update user in database
    console.log('[Signup Complete] Updating user in database...')
    const updatedUser = updateUser(user.id, {
      email,
      termsAccepted
    })
    
    if (!updatedUser) {
      console.error('[Signup Complete] User not found in database')
      logDetailsSubmit(false, user.id, email, 'User not found in database')
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: SECURITY_HEADERS }
      )
    }
    
    console.log('[Signup Complete] User updated successfully')
    
    // Check free beta eligibility (first 20 users)
    const totalUsers = getUserCount()
    const isFreeBeta = totalUsers <= 20
    
    console.log('[Signup Complete] Free beta check:', {
      totalUsers,
      isFreeBeta
    })
    
    // If free beta, mark as paid and trigger provisioning
    if (isFreeBeta) {
      console.log('[Signup Complete] Marking as free beta user...')
      
      updateUser(updatedUser.id, { 
        subscriptionStatus: 'active',
        subscriptionPlan: 'free_beta'
      })
      
      console.log('[Signup Complete] Triggering provisioning...')
      
      // Trigger provisioning
      try {
        const provResponse = await fetch(`${request.nextUrl.origin}/api/provisioning/start`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('Cookie') || ''
          }
        })
        
        console.log('[Signup Complete] Provisioning trigger response:', provResponse.status)
        
        if (!provResponse.ok) {
          const errorText = await provResponse.text()
          console.error('[Signup Complete] Provisioning trigger failed:', errorText)
        }
      } catch (error) {
        console.error('[Signup Complete] Failed to trigger provisioning:', error)
        // Don't fail the request - provisioning can be retried from dashboard
      }
    }
    
    // Log successful details submission
    logDetailsSubmit(true, updatedUser.id, updatedUser.email!)
    
    console.log('[Signup Complete] Success! Returning response...')
    console.log('[Signup Complete] Response:', {
      success: true,
      freeBeta: isFreeBeta,
      userId: updatedUser.id
    })
    
    return NextResponse.json({
      success: true,
      freeBeta: isFreeBeta,
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
