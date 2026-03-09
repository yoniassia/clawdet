import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { findUserById, findUserByStripeCustomerId, findUserByStripeSubscriptionId, updateUser } from '@/lib/db'
import { getBillingCycleFromPriceId, getPlanByPriceId } from '@/lib/billing'
import { startProvisioningJob } from '@/lib/provisioner-v2'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    let event: Stripe.Event
    if (stripe && webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } else {
      event = JSON.parse(body)
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpsert(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break
      default:
        console.log(`Unhandled Stripe event: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error?.message || 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  if (!userId) return

  const user = findUserById(userId)
  if (!user) return

  const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id

  updateUser(userId, {
    paid: true,
    paidAt: new Date().toISOString(),
    paymentMethod: 'stripe',
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
  })

  if (stripe && subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    await handleSubscriptionUpsert(subscription, userId)
  }

  if (!user.instanceUrl && user.provisioningStatus !== 'complete') {
    updateUser(userId, { provisioningStatus: 'pending' })
    await startProvisioningJob(userId)
  }
}

async function handleSubscriptionUpsert(subscription: Stripe.Subscription, fallbackUserId?: string) {
  const priceId = subscription.items.data[0]?.price?.id
  const plan = getPlanByPriceId(priceId)
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id
  const user =
    (fallbackUserId ? findUserById(fallbackUserId) : undefined) ||
    findUserByStripeSubscriptionId(subscription.id) ||
    findUserByStripeCustomerId(customerId)

  if (!user) {
    console.warn('No user found for subscription', subscription.id)
    return
  }

  updateUser(user.id, {
    paid: subscription.status === 'active' || subscription.status === 'trialing' || subscription.status === 'past_due',
    paymentMethod: 'stripe',
    subscriptionStatus: subscription.status as any,
    subscriptionPlan: (plan?.id || user.subscriptionPlan || 'starter') as any,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    billingCycle: getBillingCycleFromPriceId(priceId),
    currentPeriodEnd: subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : user.currentPeriodEnd,
    tokensLimit: plan?.monthlyTokens || user.tokensLimit || 100_000,
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id
  const user = findUserByStripeSubscriptionId(subscription.id) || findUserByStripeCustomerId(customerId)
  if (!user) return

  updateUser(user.id, {
    paid: false,
    subscriptionStatus: 'cancelled',
    currentPeriodEnd: new Date().toISOString(),
  })
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id
  if (!customerId) return
  const user = findUserByStripeCustomerId(customerId)
  if (!user) return

  updateUser(user.id, {
    paid: false,
    subscriptionStatus: 'past_due',
  })
}
