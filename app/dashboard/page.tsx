'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './dashboard.module.css'

interface UserData {
  userId: string
  username: string
  name: string
  profileImage?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
        } else {
          router.push('/signup')
        }
      })
      .catch(() => router.push('/signup'))
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Welcome, {user.name}! 🎉</h1>
        <p className={styles.subtitle}>@{user.username}</p>
        
        <div className={styles.card}>
          <h2>Next Step: Complete Payment</h2>
          <p>
            You're almost there! Complete your payment to get your own dedicated 
            Clawdet instance at <strong>{user.username}.clawdet.com</strong>
          </p>
          
          <div className={styles.pricing}>
            <div className={styles.price}>
              <span className={styles.currency}>$</span>
              <span className={styles.amount}>20</span>
              <span className={styles.period}>/month</span>
            </div>
            
            <ul className={styles.features}>
              <li>✅ Unlimited AI conversations</li>
              <li>✅ Your own subdomain</li>
              <li>✅ Tool integrations</li>
              <li>✅ 24/7 availability</li>
            </ul>
          </div>
          
          <button 
            className={styles.payButton}
            onClick={() => router.push('/checkout')}
          >
            Continue to Payment
          </button>
        </div>
        
        <div className={styles.info}>
          <p>
            <strong>Note:</strong> This is a test environment. In production, 
            real payment processing will be enabled.
          </p>
        </div>
      </div>
    </div>
  )
}
