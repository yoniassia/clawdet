'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './checkout.module.css'

interface UserSession {
  userId: string
  username: string
  name: string
  profileImage?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Verify user is authenticated
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setUser(data.user)
        } else {
          router.push('/signup')
        }
        setLoading(false)
      })
      .catch(() => {
        router.push('/signup')
      })
  }, [router])

  const handleCheckout = async () => {
    setProcessing(true)
    setError('')
    
    try {
      const res = await fetch('/api/payment/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await res.json()
      
      if (res.ok && data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutUrl
      } else {
        setError(data.error || 'Failed to create checkout session')
        setProcessing(false)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Complete Your Setup</h1>
          <p className={styles.subtitle}>
            You're one step away from your own Clawdet instance
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.productInfo}>
            <div className={styles.productHeader}>
              <h2 className={styles.productName}>Clawdet Personal Instance</h2>
              <div className={styles.price}>
                <span className={styles.currency}>$</span>
                <span className={styles.amount}>20</span>
                <span className={styles.period}>/month</span>
              </div>
            </div>

            <ul className={styles.features}>
              <li>
                <span className={styles.checkmark}>✓</span>
                Dedicated VPS with OpenClaw installed
              </li>
              <li>
                <span className={styles.checkmark}>✓</span>
                Grok 4.2 AI integration (unlimited usage)
              </li>
              <li>
                <span className={styles.checkmark}>✓</span>
                X/Twitter integration enabled
              </li>
              <li>
                <span className={styles.checkmark}>✓</span>
                Your own subdomain: <code>{user?.username}.clawdet.com</code>
              </li>
              <li>
                <span className={styles.checkmark}>✓</span>
                24/7 availability with auto-provisioning
              </li>
              <li>
                <span className={styles.checkmark}>✓</span>
                SSL certificate included
              </li>
              <li>
                <span className={styles.checkmark}>✓</span>
                Cancel anytime, no long-term commitment
              </li>
            </ul>
          </div>

          {error && (
            <div className={styles.error}>{error}</div>
          )}

          <button
            onClick={handleCheckout}
            disabled={processing}
            className={styles.checkoutButton}
          >
            {processing ? 'Redirecting to payment...' : 'Proceed to Payment'}
          </button>

          <div className={styles.secureNote}>
            <svg className={styles.lockIcon} viewBox="0 0 24 24" fill="none">
              <path d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7c0-2.757-2.243-5-5-5zm-3 5c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7zm3 9a2 2 0 110-4 2 2 0 010 4z" fill="currentColor"/>
            </svg>
            <span>Secure payment powered by Stripe</span>
          </div>

          <p className={styles.note}>
            <strong>What happens next:</strong> After payment, your VPS will be automatically 
            provisioned within 5-10 minutes. You'll receive your instance URL and 
            setup instructions via email.
          </p>
        </div>

        <a href="/dashboard" className={styles.backLink}>
          ← Back to dashboard
        </a>
      </div>
    </div>
  )
}
