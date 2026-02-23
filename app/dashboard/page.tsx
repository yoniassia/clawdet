'use client'

import { useEffect, useState, useRef } from 'react'
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

interface LogEntry {
  time: string
  msg: string
  type: 'info' | 'success' | 'error' | 'warn'
}

interface StepInfo {
  name: string
  icon: string
  description: string
}

interface ProvisioningStatus {
  status: string
  step: number
  totalSteps: number
  stepName: string
  progress: number
  message: string
  instanceUrl?: string
  logs: LogEntry[]
  steps: StepInfo[]
}

const DEFAULT_STEPS: StepInfo[] = [
  { name: 'Validation', icon: '🔍', description: 'Validating configuration...' },
  { name: 'VPS Creation', icon: '🖥️', description: 'Creating your VPS server...' },
  { name: 'DNS Configuration', icon: '🌐', description: 'Setting up your domain...' },
  { name: 'SSH Setup', icon: '🔑', description: 'Establishing secure connection...' },
  { name: 'Dependencies Install', icon: '📦', description: 'Installing system packages...' },
  { name: 'OpenClaw Install', icon: '🧠', description: 'Installing OpenClaw...' },
  { name: 'SSL Setup', icon: '🔒', description: 'Configuring HTTPS...' },
  { name: 'Startup & Verify', icon: '🚀', description: 'Starting services...' },
]

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [provisioning, setProvisioning] = useState<ProvisioningStatus | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
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
      
      if (data.status === 'complete' && !showConfetti) {
        setShowConfetti(true)
      }
      
      if (data.status !== 'complete' && data.status !== 'failed') {
        setTimeout(() => fetchProvisioningStatus(userId), 3000)
      }
    } catch (error) {
      console.error('Failed to fetch provisioning status:', error)
    }
  }

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [provisioning?.logs])

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingScreen}>
          <div className={styles.spinner} />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const steps = provisioning?.steps || DEFAULT_STEPS
  const currentStep = provisioning?.step ?? 0
  const isComplete = provisioning?.status === 'complete'
  const isFailed = provisioning?.status === 'failed'

  // Success view
  if (user.paid && isComplete && (user.instanceUrl || provisioning?.instanceUrl)) {
    const instanceUrl = user.instanceUrl || provisioning?.instanceUrl || ''
    const subdomain = user.username.toLowerCase().replace(/[^a-z0-9-]/g, '-')

    return (
      <div className={styles.container}>
        {showConfetti && <Confetti />}
        <div className={styles.content}>
          <div className={styles.successView}>
            <div className={styles.successCheckWrap}>
              <div className={styles.successCheck}>✓</div>
            </div>
            <h1 className={styles.heroTitle}>Your AI is Ready! 🎉</h1>
            <p className={styles.heroSub}>
              Live at <span className={styles.accentText}>{subdomain}.clawdet.com</span>
            </p>

            <div className={styles.glassCard}>
              <div className={styles.urlDisplay}>
                <span className={styles.urlLabel}>Instance URL</span>
                <a href={instanceUrl} target="_blank" rel="noopener noreferrer" className={styles.urlLink}>
                  {instanceUrl}
                </a>
              </div>
              <div className={styles.infoRow}>
                <span>Server IP</span>
                <span className={styles.mono}>{user.hetznerVpsIp || '—'}</span>
              </div>
              <div className={styles.infoRow}>
                <span>Status</span>
                <span className={styles.statusBadge}>● Active</span>
              </div>
            </div>

            <div className={styles.ctaGroup}>
              <a href={instanceUrl} target="_blank" rel="noopener noreferrer" className={styles.ctaPrimary}>
                Open Your Instance →
              </a>
              <a href={`https://t.me/BotFather`} target="_blank" rel="noopener noreferrer" className={styles.ctaSecondary}>
                ✈️ Connect Telegram Bot
              </a>
            </div>

            <div className={styles.glassCard} style={{ marginTop: '1rem' }}>
              <h3 className={styles.cardTitle}>What&apos;s Included</h3>
              <div className={styles.featureGrid}>
                <div className={styles.featureItem}>✅ Dedicated VPS (4GB RAM)</div>
                <div className={styles.featureItem}>✅ Pre-configured Grok AI</div>
                <div className={styles.featureItem}>✅ HTTPS with Cloudflare SSL</div>
                <div className={styles.featureItem}>✅ Your own subdomain</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Provisioning in progress
  if (user.paid && provisioning) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.buildView}>
            {/* Header */}
            <div className={styles.buildHeader}>
              <div className={styles.buildSpinner}>
                <div className={styles.spinnerRing} />
                <span className={styles.spinnerIcon}>{isFailed ? '❌' : (steps[currentStep]?.icon || '🚀')}</span>
              </div>
              <h1 className={styles.heroTitle}>
                {isFailed ? 'Provisioning Failed' : 'Building Your Instance...'}
              </h1>
              <p className={styles.heroSub}>{provisioning.message}</p>
            </div>

            {/* Progress bar */}
            <div className={styles.progressWrap}>
              <div className={styles.progressTrack}>
                <div 
                  className={styles.progressBar}
                  style={{ width: `${provisioning.progress}%` }}
                />
              </div>
              <span className={styles.progressLabel}>{provisioning.progress}%</span>
            </div>

            {/* Steps */}
            <div className={styles.stepsContainer}>
              {steps.map((step, i) => {
                const done = i < currentStep
                const active = i === currentStep && !isFailed
                const future = i > currentStep
                return (
                  <div 
                    key={i} 
                    className={`${styles.stepRow} ${done ? styles.stepDone : ''} ${active ? styles.stepActive : ''} ${future ? styles.stepFuture : ''}`}
                  >
                    <div className={styles.stepIcon}>
                      {done ? <span className={styles.checkIcon}>✓</span> : <span>{step.icon}</span>}
                    </div>
                    <div className={styles.stepInfo}>
                      <span className={styles.stepName}>{step.name}</span>
                      {active && <span className={styles.stepDots}>...</span>}
                    </div>
                    {active && <div className={styles.stepSpinner} />}
                  </div>
                )
              })}
            </div>

            {/* Terminal log */}
            {provisioning.logs && provisioning.logs.length > 0 && (
              <div className={styles.terminal}>
                <div className={styles.terminalHeader}>
                  <span className={styles.terminalDot} style={{ background: '#ff5f57' }} />
                  <span className={styles.terminalDot} style={{ background: '#ffbd2e' }} />
                  <span className={styles.terminalDot} style={{ background: '#28c840' }} />
                  <span className={styles.terminalTitle}>build log</span>
                </div>
                <div className={styles.terminalBody} ref={logRef}>
                  {provisioning.logs.map((log, i) => (
                    <div key={i} className={`${styles.logLine} ${styles[`log_${log.type}`]}`}>
                      <span className={styles.logTime}>
                        {new Date(log.time).toLocaleTimeString()}
                      </span>
                      <span>{log.msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isFailed && (
              <div className={styles.errorBanner}>
                ❌ Provisioning failed. Please contact support@clawdet.com
              </div>
            )}

            {!isFailed && (
              <p className={styles.waitNote}>
                ⏱️ Estimated time: 5-10 minutes • This page updates automatically
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Free beta prompt (default)
  const handleFreeBeta = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/provisioning/free-beta', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        alert(`🎉 Success! Your instance is being provisioned. (Spot ${data.instanceNumber}/${data.totalLimit})`)
        window.location.reload()
      } else {
        alert(data.message || data.error || 'Failed to start provisioning')
      }
    } catch {
      alert('Failed to start provisioning. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.heroTitle}>Welcome, {user.name}! 🎉</h1>
        <p className={styles.heroSub}>@{user.username}</p>
        
        <div className={styles.glassCard}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#2EE68A', marginBottom: '0.5rem' }}>🎉 Limited Time: Free Beta!</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '0' }}>
              <strong>First 20 users get a FREE instance!</strong>
            </p>
          </div>
          
          <p style={{ color: '#a0a0a0', lineHeight: 1.6 }}>
            Get your own dedicated OpenClaw instance at{' '}
            <strong style={{ color: '#2EE68A' }}>{user.username}.clawdet.com</strong>
          </p>
          
          <div style={{ textAlign: 'center', margin: '2rem 0' }}>
            <div style={{ textDecoration: 'line-through', opacity: 0.4, fontSize: '1.2rem', color: '#888' }}>$20/month</div>
            <div style={{ fontSize: '2.5rem', color: '#2EE68A', fontWeight: 900 }}>FREE <span style={{ fontSize: '1rem', fontWeight: 400 }}>(Beta)</span></div>
          </div>
          
          <div className={styles.featureGrid}>
            <div className={styles.featureItem}>✅ Dedicated VPS (4GB RAM, 2 vCPU)</div>
            <div className={styles.featureItem}>✅ Your own subdomain</div>
            <div className={styles.featureItem}>✅ Automatic SSL & DNS</div>
            <div className={styles.featureItem}>✅ Pre-configured with Grok AI</div>
            <div className={styles.featureItem}>✅ Advanced mode enabled</div>
            <div className={styles.featureItem}>✅ Full tool integrations</div>
          </div>
          
          <button className={styles.ctaPrimary} onClick={handleFreeBeta} disabled={loading} style={{ width: '100%', marginTop: '1.5rem' }}>
            {loading ? 'Starting Provisioning...' : '🚀 Get My Free Instance Now'}
          </button>
          
          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#666' }}>
            No credit card required • Provisioned in 10 minutes
          </p>
        </div>
      </div>
    </div>
  )
}

function Confetti() {
  const colors = ['#2EE68A', '#1DA1F2', '#FFD700', '#FF6B6B', '#A855F7', '#fff']
  return (
    <div className={styles.confettiWrap} aria-hidden>
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className={styles.confettiPiece}
          style={{
            left: `${Math.random() * 100}%`,
            background: colors[i % colors.length],
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  )
}
