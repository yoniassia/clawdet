import { NextRequest, NextResponse } from 'next/server'
import { updateUser, findUserById } from '@/lib/db'
import { startProvisioningJob } from '@/lib/provisioner'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    let event: any

    // Real Stripe webhook with signature verification
    if (STRIPE_SECRET_KEY && STRIPE_WEBHOOK_SECRET && signature) {
      try {
        const stripe = require('stripe')(STRIPE_SECRET_KEY)
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          STRIPE_WEBHOOK_SECRET
        )
        console.log('✅ Stripe webhook signature verified')
      } catch (err: any) {
        console.error('⚠️ Webhook signature verification failed:', err.message)
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 400 }
        )
      }
    } else {
      // Mock mode: parse the JSON directly (for testing)
      console.log('⚠️ Mock mode: No signature verification')
      event = JSON.parse(body)
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutComplete(session: any) {
  console.log('🎉 Payment successful for session:', session.id)
  
  const userId = session.metadata?.userId
  if (!userId) {
    console.error('❌ No userId in metadata')
    return
  }

  const user = findUserById(userId)
  if (!user) {
    console.error(`❌ User not found: ${userId}`)
    return
  }

  console.log(`💰 Marking user ${user.xUsername} as paid`)

  // Update user: mark as paid and set provisioning to pending
  const updatedUser = updateUser(userId, {
    paid: true,
    provisioningStatus: 'pending'
  })

  if (!updatedUser) {
    console.error(`❌ Failed to update user: ${userId}`)
    return
  }

  console.log(`✅ User ${user.xUsername} marked as paid. Provisioning status: pending`)

  // Trigger provisioning workflow in background
  console.log('🚀 Triggering VPS provisioning...')
  await startProvisioningJob(userId)
  
  // Optional: Send confirmation notification
  // await sendConfirmationNotification(updatedUser)
  
  console.log('📋 Provisioning started in background')
}

async function handleSubscriptionDeleted(subscription: any) {
  console.log('⚠️ Subscription cancelled:', subscription.id)
  
  // TODO: Handle subscription cancellation
  // - Mark user as unpaid
  // - Optionally pause/delete their VPS
  // - Send notification
}

async function handlePaymentFailed(invoice: any) {
  console.log('❌ Payment failed for invoice:', invoice.id)
  
  // TODO: Handle payment failure
  // - Send notification to user
  // - Grace period before shutting down instance
}

// Optional: Send confirmation via X DM or email
async function sendConfirmationNotification(user: any) {
  // TODO: Implement notification
  // Options:
  // 1. X DM using message tool
  // 2. Email using Resend/SendGrid
  // 3. Telegram notification
  
  console.log(`📬 Would send confirmation to ${user.xUsername} (${user.email})`)
}
