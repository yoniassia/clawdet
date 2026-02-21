import { NextRequest, NextResponse } from 'next/server'
import { updateUser } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const sessionCookie = request.cookies.get('user_session')
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const session = JSON.parse(sessionCookie.value)
    
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
    
    // Update user in database - mark as paid (free tier during beta)
    const updatedUser = updateUser(session.userId, {
      email,
      termsAccepted,
      paid: true,
      paymentMethod: 'free_beta',
      paidAt: new Date().toISOString()
    })
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    console.log('[Signup Complete] User marked as free beta:', {
      id: updatedUser.id,
      email: updatedUser.email,
      paid: true
    })
    
    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        termsAccepted: updatedUser.termsAccepted,
        paid: true
      }
    })
  } catch (error) {
    console.error('Signup complete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
