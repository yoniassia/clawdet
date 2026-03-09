import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { requireAuth } from '@/lib/auth-middleware'
import { findUserById, updateUser } from '@/lib/db'
import { BILLING_PLANS, getAppUrl, getBillingPlan, getPriceId, type BillingCycle } from '@/lib/billing'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (auth instanceof NextResponse) return auth

    const user = findUserById(auth.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    if (!user.email) {
      return NextResponse.json({ error: 'Email required. Please complete signup first.' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const planId = String(body.planId || 'growth')
    const billingCycle = (body.billingCycle === 'annual' ? 'annual' : 'monthly') as BillingCycle
    const plan = getBillingPlan(planId)
    const priceId = getPriceId(planId, billingCycle)

    if (!plan || !priceId) {
      return NextResponse.json({
        error: 'Invalid plan selection',
        availablePlans: BILLING_PLANS.map(plan => ({ id: plan.id, name: plan.name }))
      }, { status: 400 })
    }

    if (!stripe) {
      const mockCheckoutUrl = `/checkout/mock?userId=${user.id}&planId=${planId}&billingCycle=${billingCycle}&email=${encodeURIComponent(user.email)}`
      return NextResponse.json({ success: true, checkoutUrl: mockCheckoutUrl, mock: true })
    }

    let customerId = user.stripeCustomerId
    if (!customerId) {
      const existingCustomers = await stripe.customers.list({ email: user.email, limit: 1 })
      customerId = existingCustomers.data[0]?.id
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name || user.xName || user.xUsername || user.email,
          metadata: { userId: user.id },
        })
        customerId = customer.id
      }
      updateUser(user.id, { stripeCustomerId: customerId })
    }

    const appUrl = getAppUrl()
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_update: { name: 'auto', address: 'auto' },
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing?canceled=true`,
      allow_promotion_codes: true,
      metadata: {
        userId: user.id,
        planId: plan.id,
        billingCycle,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planId: plan.id,
          billingCycle,
        },
        trial_period_days: 14,
      },
    })

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSession.url,
      planId: plan.id,
      billingCycle,
      priceId,
    })
  } catch (error) {
    console.error('Payment session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
