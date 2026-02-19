import { NextRequest, NextResponse } from 'next/server'
import { updateUser } from '@/lib/db'
import { requireAuth } from '@/lib/auth-middleware'
import { SECURITY_HEADERS } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = requireAuth(request)
    if (user instanceof NextResponse) {
      return user // Return auth error
    }
    
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
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: SECURITY_HEADERS }
      )
    }
    
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}
