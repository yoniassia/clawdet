'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from './mock.module.css'

function MockCheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [processing, setProcessing] = useState(false)

  const userId = searchParams.get('userId')
  const email = searchParams.get('email')

  const handleMockPayment = async () => {
    setProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // In a real scenario, this would trigger a webhook
    // For mock, we'll update the user directly
    try {
      const res = await fetch('/api/payment/mock-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      
      if (res.ok) {
        router.push('/checkout/success?mock=true')
      } else {
        alert('Mock payment failed')
        setProcessing(false)
      }
    } catch (error) {
      alert('Error processing mock payment')
      setProcessing(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>🧪 Test Mode Checkout</h1>
          <p className={styles.subtitle}>
            This is a simulated Stripe checkout for testing
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.info}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{email}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Amount:</span>
              <span className={styles.value}>$20.00 / month</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Product:</span>
              <span className={styles.value}>Clawdet Personal Instance</span>
            </div>
          </div>

          <div className={styles.testNote}>
            <p>
              <strong>⚠️ Test Mode:</strong> No real payment will be processed.
              Click the button below to simulate a successful payment.
            </p>
          </div>

          <button
            onClick={handleMockPayment}
            disabled={processing}
            className={styles.payButton}
          >
            {processing ? 'Processing...' : 'Simulate Payment Success'}
          </button>

          <button
            onClick={() => router.push('/checkout?canceled=true')}
            disabled={processing}
            className={styles.cancelButton}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MockCheckoutPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.loading}>Loading...</div>
        </div>
      </div>
    }>
      <MockCheckoutContent />
    </Suspense>
  )
}
