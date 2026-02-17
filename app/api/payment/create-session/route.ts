import { NextRequest, NextResponse } from 'next/server'
import { findUserById } from '@/lib/db'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

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
    
    // Get user from database
    const user = findUserById(session.userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    if (!user.email) {
      return NextResponse.json(
        { error: 'Email required. Please complete signup first.' },
        { status: 400 }
      )
    }

    // Check if Stripe is configured
    if (!STRIPE_SECRET_KEY || !STRIPE_PRICE_ID) {
      // Mock mode: simulate Stripe checkout
      console.log('Stripe not configured. Using mock checkout.')
      
      // For testing, return a mock checkout URL
      const mockCheckoutUrl = `/checkout/mock?userId=${user.id}&email=${encodeURIComponent(user.email)}`
      
      return NextResponse.json({
        success: true,
        checkoutUrl: mockCheckoutUrl,
        mock: true
      })
    }

    // Real Stripe integration
    try {
      const stripe = require('stripe')(STRIPE_SECRET_KEY)
      
      const checkoutSession = await stripe.checkout.sessions.create({
        customer_email: user.email,
        line_items: [
          {
            price: STRIPE_PRICE_ID,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/checkout?canceled=true`,
        metadata: {
          userId: user.id,
          xUsername: user.xUsername
        }
      })

      return NextResponse.json({
        success: true,
        checkoutUrl: checkoutSession.url
      })
    } catch (stripeError) {
      console.error('Stripe error:', stripeError)
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Payment session error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
