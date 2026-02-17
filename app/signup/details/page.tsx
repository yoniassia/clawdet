'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './details.module.css'

interface UserSession {
  userId: string
  username: string
  name: string
  profileImage?: string
}

export default function SignupDetailsPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserSession | null>(null)
  const [email, setEmail] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !termsAccepted) {
      setError('Please fill in all fields and accept the terms')
      return
    }
    
    setSubmitting(true)
    setError('')
    
    try {
      const res = await fetch('/api/signup/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, termsAccepted })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        // Redirect to checkout
        router.push('/checkout')
      } else {
        setError(data.error || 'Failed to save details')
        setSubmitting(false)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setSubmitting(false)
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
          {user?.profileImage && (
            <img 
              src={user.profileImage} 
              alt={user.name}
              className={styles.avatar}
            />
          )}
          <h1 className={styles.title}>Welcome, {user?.name}!</h1>
          <p className={styles.subtitle}>
            Just a few more details to get you started
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className={styles.input}
              required
            />
            <p className={styles.hint}>
              We'll send your instance details and updates here
            </p>
          </div>

          <div className={styles.checkboxField}>
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className={styles.checkbox}
              required
            />
            <label htmlFor="terms" className={styles.checkboxLabel}>
              I agree to the{' '}
              <a href="/terms" target="_blank" className={styles.link}>
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" target="_blank" className={styles.link}>
                Privacy Policy
              </a>
            </label>
          </div>

          {error && (
            <div className={styles.error}>{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting || !email || !termsAccepted}
            className={styles.submitButton}
          >
            {submitting ? 'Saving...' : 'Continue to Payment'}
          </button>
        </form>

        <div className={styles.pricing}>
          <p className={styles.pricingText}>
            Next: Pay <strong>$20/month</strong> to provision your instance
          </p>
        </div>
      </div>
    </div>
  )
}
