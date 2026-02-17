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

  // Show free beta prompt (default)
  const handleFreeBeta = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/provisioning/free-beta', {
        method: 'POST'
      })
      
      const data = await res.json()
      
      if (res.ok) {
        // Success! Start polling for status
        alert(`🎉 Success! Your instance is being provisioned. (Spot ${data.instanceNumber}/${data.totalLimit})`)
        
        // Reload to show provisioning status
        window.location.reload()
      } else {
        alert(data.message || data.error || 'Failed to start provisioning')
      }
    } catch (error) {
      alert('Failed to start provisioning. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Welcome, {user.name}! 🎉</h1>
        <p className={styles.subtitle}>@{user.username}</p>
        
        <div className={styles.card}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#1DA1F2', marginBottom: '0.5rem' }}>🎉 Limited Time: Free Beta!</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '0' }}>
              <strong>First 20 users get a FREE instance!</strong>
            </p>
          </div>
          
          <p>
            You're almost there! Get your own dedicated OpenClaw instance at{' '}
            <strong>{user.username}.clawdet.com</strong>
          </p>
          
          <div className={styles.pricing}>
            <div className={styles.price}>
              <span className={styles.currency} style={{ textDecoration: 'line-through', opacity: 0.5 }}>$</span>
              <span className={styles.amount} style={{ textDecoration: 'line-through', opacity: 0.5 }}>20</span>
              <span className={styles.period} style={{ textDecoration: 'line-through', opacity: 0.5 }}>/month</span>
              <div style={{ fontSize: '2rem', color: '#1DA1F2', marginTop: '0.5rem' }}>
                <strong>FREE</strong> <span style={{ fontSize: '1rem' }}>(Beta)</span>
              </div>
            </div>
            
            <ul className={styles.features}>
              <li>✅ Dedicated VPS (4GB RAM, 2 vCPU)</li>
              <li>✅ Your own subdomain ({user.username}.clawdet.com)</li>
              <li>✅ Automatic SSL & DNS</li>
              <li>✅ Pre-configured with Grok AI</li>
              <li>✅ Advanced mode enabled</li>
              <li>✅ Full tool integrations</li>
            </ul>
          </div>
          
          <button 
            className={styles.payButton}
            onClick={handleFreeBeta}
            disabled={loading}
            style={{ 
              background: 'linear-gradient(135deg, #1DA1F2 0%, #0084C7 100%)',
              fontSize: '1.1rem',
              padding: '1rem 2rem'
            }}
          >
            {loading ? 'Starting Provisioning...' : '🚀 Get My Free Instance Now'}
          </button>
          
          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', opacity: 0.7 }}>
            No credit card required • Provisioned in 10 minutes
          </p>
        </div>
        
        <div className={styles.info}>
          <p>
            <strong>Beta Access:</strong> First 20 users get free lifetime access. 
            After that, regular pricing ($20/month) applies.
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            <strong>What happens next:</strong> Your VPS will be created, DNS configured, 
            and OpenClaw installed automatically. You'll have full access in ~10 minutes.
          </p>
        </div>
      </div>
    </div>
  )
}
