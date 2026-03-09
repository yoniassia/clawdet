const https = require('https')
const Stripe = require('stripe')
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const payload = JSON.stringify({
  id: 'evt_test_subscription_updated_1',
  object: 'event',
  type: 'customer.subscription.updated',
  data: {
    object: {
      id: 'sub_test_growth_001',
      object: 'subscription',
      customer: 'cus_U76Q3uj3XopUZU',
      status: 'active',
      current_period_end: Math.floor(Date.now() / 1000) + 2592000,
      items: { data: [{ price: { id: process.env.STRIPE_PRICE_ID_GROWTH } }] },
    },
  },
})

const signature = stripe.webhooks.generateTestHeaderString({
  payload,
  secret: process.env.STRIPE_WEBHOOK_SECRET,
})

const req = https.request(
  'https://clawdet.com/api/webhooks/stripe',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Stripe-Signature': signature,
      'Content-Length': Buffer.byteLength(payload),
    },
  },
  (res) => {
    let body = ''
    res.on('data', (d) => (body += d))
    res.on('end', () => console.log(res.statusCode, body))
  }
)
req.on('error', console.error)
req.write(payload)
req.end()
