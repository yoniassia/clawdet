'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from './success.module.css'

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [countdown, setCountdown] = useState(5)

  const isMock = searchParams.get('mock') === 'true'

  useEffect(() => {
    // Fetch user info
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setUser(data.user)
        }
      })
      .catch(console.error)

    // Countdown to redirect
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

        <h1 className={styles.title}>Payment Successful! 🎉</h1>
        
        {isMock && (
          <div className={styles.mockBadge}>
            Test Mode
          </div>
        )}

        <p className={styles.message}>
          Thank you for signing up for Clawdet!
        </p>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>What's Next?</h2>
          
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Provisioning Your Instance</h3>
                <p>
                  We're setting up your dedicated VPS with OpenClaw installed.
                  This usually takes 5-10 minutes.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Configuration</h3>
                <p>
                  Your instance will be pre-configured with Grok 4.2 AI and
                  your X/Twitter integration.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Access Your Instance</h3>
                <p>
                  You'll receive an email with your subdomain URL and setup
                  instructions once provisioning is complete.
                </p>
              </div>
            </div>
          </div>

          {user?.username && (
            <div className={styles.urlPreview}>
              <p className={styles.urlLabel}>Your instance URL (once ready):</p>
              <code className={styles.url}>https://{user.username}.clawdet.com</code>
            </div>
          )}
        </div>

        <div className={styles.redirectNote}>
          Redirecting to dashboard in {countdown} seconds...
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          className={styles.dashboardButton}
        >
          Go to Dashboard Now
        </button>
      </div>
    </div>
  )
}
