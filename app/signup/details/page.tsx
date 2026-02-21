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
  const [isFreeBeta, setIsFreeBeta] = useState(false)

  useEffect(() => {
    console.log('[SignupDetails] Page loaded, checking auth...')
    
    // Verify user is authenticated
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        console.log('[SignupDetails] Auth response:', data)
        
        if (data.authenticated) {
          setUser(data.user)
          console.log('[SignupDetails] User authenticated:', data.user.username)
          
          // Check free beta eligibility
          console.log('[SignupDetails] Checking free beta eligibility...')
          return fetch('/api/provisioning/free-beta')
        } else {
          console.log('[SignupDetails] Not authenticated, redirecting to /signup')
          router.push('/signup')
          return null
        }
      })
      .then(res => res ? res.json() : null)
      .then(data => {
        if (data) {
          console.log('[SignupDetails] Free beta check:', data)
          setIsFreeBeta(data.eligible)
          console.log('[SignupDetails] Is free beta?', data.eligible)
        }
        setLoading(false)
        console.log('[SignupDetails] Page ready')
      })
      .catch((error) => {
        console.error('[SignupDetails] Error during load:', error)
        router.push('/signup')
      })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('[SignupDetails] Form submitted')
    console.log('[SignupDetails] Email:', email)
    console.log('[SignupDetails] Terms accepted:', termsAccepted)
    
    if (!email || !termsAccepted) {
      const errorMsg = 'Please fill in all fields and accept the terms'
      console.error('[SignupDetails] Validation failed:', errorMsg)
      setError(errorMsg)
      return
    }
    
    setSubmitting(true)
    setError('')
    
    try {
      console.log('[SignupDetails] Sending POST to /api/signup/complete...')
      
      const res = await fetch('/api/signup/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, termsAccepted })
      })
      
      console.log('[SignupDetails] Response status:', res.status)
      
      const data = await res.json()
      console.log('[SignupDetails] Response data:', data)
      
      if (res.ok) {
        // Redirect to dashboard (free beta - skip payment)
        router.push('/dashboard')
      } else {
        const errorMsg = data.error || 'Failed to save details'
        console.error('[SignupDetails] API error:', errorMsg)
        setError(errorMsg)
        setSubmitting(false)
      }
    } catch (err) {
      const errorMsg = 'An error occurred. Please try again.'
      console.error('[SignupDetails] Catch error:', err)
      setError(errorMsg)
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
            {submitting ? 'Saving...' : 'Complete Setup'}
          </button>
        </form>

        <div className={styles.pricing}>
          <p className={styles.pricingText}>
            🎉 <strong>Free Beta Access</strong> - Your instance will be ready in minutes!
          </p>
        </div>
      </div>
    </div>
  )
}
