'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from './success.module.css'

function CheckoutSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [countdown, setCountdown] = useState(8)

  const sessionId = searchParams.get('session_id')
  const isMock = searchParams.get('mock') === 'true'

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) setUser(data.user)
      })
      .catch(console.error)

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.successIcon}>
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 className={styles.title}>Subscription confirmed</h1>
        <p className={styles.message}>Stripe accepted your checkout and Clawdet is now preparing your billing-backed workspace.</p>

        {isMock && <div className={styles.mockBadge}>Test Mode</div>}

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>What happens next</h2>
          <div className={styles.steps}>
            <div className={styles.step}><div className={styles.stepNumber}>1</div><div className={styles.stepContent}><h3>Subscription activated</h3><p>Your billing status is now tied to Stripe and future renewals will be tracked via webhooks.</p></div></div>
            <div className={styles.step}><div className={styles.stepNumber}>2</div><div className={styles.stepContent}><h3>Provisioning queued</h3><p>If your instance is not already live, Clawdet will continue provisioning it in the background.</p></div></div>
            <div className={styles.step}><div className={styles.stepNumber}>3</div><div className={styles.stepContent}><h3>Usage tracking enabled</h3><p>Your dashboard now shows current-month token consumption against your plan limit.</p></div></div>
          </div>

          {sessionId && (
            <div className={styles.urlPreview}>
              <p className={styles.urlLabel}>Stripe checkout session</p>
              <code className={styles.url}>{sessionId}</code>
            </div>
          )}

          {user?.username && (
            <div className={styles.urlPreview}>
              <p className={styles.urlLabel}>Pricing page</p>
              <code className={styles.url}>https://clawdet.com/pricing</code>
            </div>
          )}
        </div>

        <div className={styles.redirectNote}>Redirecting to dashboard in {countdown} seconds...</div>
        <button onClick={() => router.push('/dashboard')} className={styles.dashboardButton}>Go to Dashboard Now</button>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className={styles.container}><div className={styles.content}><div className={styles.loading}>Loading...</div></div></div>}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
