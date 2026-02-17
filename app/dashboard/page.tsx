'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './dashboard.module.css'

interface UserData {
  userId: string
  username: string
  name: string
  profileImage?: string
  paid?: boolean
  provisioningStatus?: string
  instanceUrl?: string
  hetznerVpsIp?: string
}

interface ProvisioningStatus {
  status: string
  progress: number
  message: string
  instanceUrl?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [provisioning, setProvisioning] = useState<ProvisioningStatus | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
          
          // If user is paid, check provisioning status
          if (data.user.paid) {
            fetchProvisioningStatus(data.user.userId)
          }
        } else {
          router.push('/signup')
        }
      })
      .catch(() => router.push('/signup'))
      .finally(() => setLoading(false))
  }, [router])

  const fetchProvisioningStatus = async (userId: string) => {
    try {
      const res = await fetch(`/api/provisioning/status?userId=${userId}`)
      const data = await res.json()
      setProvisioning(data)
      
      // Poll if provisioning is in progress
      if (data.status !== 'complete' && data.status !== 'failed') {
        setTimeout(() => fetchProvisioningStatus(userId), 5000) // Poll every 5s
      }
    } catch (error) {
      console.error('Failed to fetch provisioning status:', error)
    }
  }

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

  // Show instance ready view
  if (user.paid && provisioning?.status === 'complete' && user.instanceUrl) {
    const subdomain = user.username.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.successHeader}>
            <span className={styles.successIcon}>🎉</span>
            <h1 className={styles.title}>Your Instance is Ready!</h1>
          </div>
          
          <div className={styles.card}>
            <h2>Access Your OpenClaw Instance</h2>
            
            <div className={styles.instanceInfo}>
              <div className={styles.urlBox}>
                <label>Your Instance URL:</label>
                <a href={user.instanceUrl} target="_blank" rel="noopener noreferrer" className={styles.instanceUrl}>
                  {user.instanceUrl}
                </a>
              </div>
              
              <div className={styles.details}>
                <p><strong>Subdomain:</strong> {subdomain}.clawdet.com</p>
                <p><strong>Server IP:</strong> {user.hetznerVpsIp || 'Configuring...'}</p>
                <p><strong>Status:</strong> <span className={styles.statusActive}>Active</span></p>
              </div>
            </div>
            
            <div className={styles.instructions}>
              <h3>Getting Started</h3>
              <ol>
                <li>Your OpenClaw Gateway is running at port 18789</li>
                <li>Connect via Telegram by configuring your bot token</li>
                <li>All workspace files are in <code>~/.openclaw/workspace</code></li>
                <li>Check logs: <code>journalctl -u openclaw-gateway -f</code></li>
              </ol>
            </div>
            
            <div className={styles.features}>
              <h3>What's Included</h3>
              <ul>
                <li>✅ Private VPS server (2GB RAM, 1 vCPU)</li>
                <li>✅ OpenClaw pre-installed and configured</li>
                <li>✅ Grok AI (xAI) integration enabled</li>
                <li>✅ Secure HTTPS with Cloudflare SSL</li>
                <li>✅ Your own subdomain</li>
              </ul>
            </div>
            
            <div className={styles.actions}>
              <a href={user.instanceUrl} target="_blank" rel="noopener noreferrer" className={styles.primaryButton}>
                Open Your Instance →
              </a>
              <a href="/onboarding" className={styles.secondaryButton} style={{ textAlign: 'center', textDecoration: 'none' }}>
                📚 Onboarding Guide
              </a>
              <button className={styles.secondaryButton} onClick={() => window.location.reload()}>
                Refresh Status
              </button>
            </div>
          </div>
          
          <div className={styles.support}>
            <h3>Need Help?</h3>
            <p>
              Documentation: <a href="https://clawdet.com/docs" target="_blank">clawdet.com/docs</a><br/>
              Support: support@clawdet.com<br/>
              Twitter: <a href="https://twitter.com/clawdet" target="_blank">@clawdet</a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show provisioning in progress
  if (user.paid && provisioning) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>Setting Up Your Instance...</h1>
          
          <div className={styles.card}>
            <div className={styles.provisioningStatus}>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${provisioning.progress}%` }}
                />
              </div>
              
              <p className={styles.statusMessage}>
                {provisioning.message}
              </p>
              
              <div className={styles.statusDetails}>
                <p><strong>Status:</strong> {provisioning.status}</p>
                <p><strong>Progress:</strong> {provisioning.progress}%</p>
              </div>
              
              {provisioning.status === 'failed' && (
                <div className={styles.error}>
                  <p>❌ Provisioning failed. Please contact support.</p>
                </div>
              )}
            </div>
            
            <p className={styles.estimatedTime}>
              ⏱️ Estimated time: 5-10 minutes
            </p>
            
            <p className={styles.note}>
              This page will automatically update. You can safely close this tab and come back later.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show payment prompt (default)
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
