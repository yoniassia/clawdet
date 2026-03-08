'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import styles from './dashboard.module.css'

interface UserData {
  userId: string
  username: string
  name: string
  email?: string
  profileImage?: string
  paid?: boolean
  provisioningStatus?: string
  instanceUrl?: string
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

const DOCKER_STEPS: StepInfo[] = [
  { name: 'Validation', icon: '🔍', description: 'Validating configuration...' },
  { name: 'Container Setup', icon: '🐳', description: 'Creating your AI container...' },
  { name: 'DNS Configuration', icon: '🌐', description: 'Setting up your domain...' },
  { name: 'Health Check', icon: '✅', description: 'Verifying your agent is live...' },
]

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [provisioning, setProvisioning] = useState<ProvisioningStatus | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)
  const autoProvisionTriggered = useRef(false)
  const router = useRouter()

  const autoProvision = async () => {
    try {
      const res = await fetch('/api/provisioning/free-beta', { method: 'POST' })
      if (res.ok) {
        window.location.reload()
      }
    } catch {
      // Silent — fallback button shown
    }
  }

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
          const u = data.user
          const needsProvision = !u.provisioningStatus || u.provisioningStatus === 'pending' || (!u.instanceUrl && u.provisioningStatus !== 'failed')
          
          if (u.instanceUrl && u.provisioningStatus === 'complete') {
            // Already done
            fetchProvisioningStatus(u.userId)
          } else if (u.paid && !needsProvision) {
            // In progress
            fetchProvisioningStatus(u.userId)
          } else if (!autoProvisionTriggered.current) {
            // Need to provision (new user or stuck)
            autoProvisionTriggered.current = true
            autoProvision()
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
        setTimeout(() => fetchProvisioningStatus(userId), 2000)
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
          <p>Deploying your agent...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const steps = provisioning?.steps || DOCKER_STEPS
  const currentStep = provisioning?.step ?? 0
  const isComplete = provisioning?.status === 'complete'
  const isFailed = provisioning?.status === 'failed'

  // ============ SUCCESS VIEW ============
  if (user.paid && isComplete && (user.instanceUrl || provisioning?.instanceUrl)) {
    const instanceUrl = user.instanceUrl || provisioning?.instanceUrl || ''
    const username = user.username || user.email?.split('@')[0] || ''
    const subdomain = username.toLowerCase().replace(/[^a-z0-9-]/g, '-')

    return (
      <div className={styles.container}>
        {showConfetti && <Confetti />}
        <div className={styles.content}>
          <div className={styles.successView}>
            <div className={styles.successCheckWrap}>
              <div className={styles.successCheck}>✓</div>
            </div>
            <h1 className={styles.heroTitle}>Your Agent is Live! 🐾</h1>
            <p className={styles.heroSub}>
              Running at <span className={styles.accentText}>{subdomain}.clawdet.com</span>
            </p>

            <div className={styles.glassCard}>
              <div className={styles.urlDisplay}>
                <span className={styles.urlLabel}>Chat</span>
                <a href={instanceUrl} target="_blank" rel="noopener noreferrer" className={styles.urlLink}>
                  {instanceUrl}
                </a>
              </div>
              <div className={styles.infoRow}>
                <span>Engine</span>
                <span className={styles.mono}>NanoClaw Docker</span>
              </div>
              <div className={styles.infoRow}>
                <span>Model</span>
                <span className={styles.mono}>Claude Sonnet 4.5</span>
              </div>
              <div className={styles.infoRow}>
                <span>Status</span>
                <span className={styles.statusBadge}>● Running</span>
              </div>
            </div>

            <div className={styles.ctaGroup}>
              <a href={instanceUrl} target="_blank" rel="noopener noreferrer" className={styles.ctaPrimary}>
                Chat with Your Agent →
              </a>
            </div>

            <div className={styles.glassCard} style={{ marginTop: '1rem' }}>
              <h3 className={styles.cardTitle}>What You Get</h3>
              <div className={styles.featureGrid}>
                <div className={styles.featureItem}>🐳 Isolated Docker container</div>
                <div className={styles.featureItem}>🧠 Claude Sonnet 4.5</div>
                <div className={styles.featureItem}>🔌 REST API + MCP</div>
                <div className={styles.featureItem}>✏️ Custom personality (CLAUDE.md)</div>
                <div className={styles.featureItem}>📡 Telegram / Slack / Web</div>
                <div className={styles.featureItem}>🔒 Fully isolated workspace</div>
              </div>
            </div>

            <div className={styles.glassCard} style={{ marginTop: '1rem' }}>
              <h3 className={styles.cardTitle}>API Access</h3>
              <div className={styles.codeBlock}>
                <pre className={styles.code}>{`curl -X POST ${instanceUrl}/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"messages":[{"role":"user","content":"Hello!"}]}'`}</pre>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#666', margin: '8px 0 0' }}>
                Manage agents via <a href="/api/mcp" style={{ color: '#2EE68A' }}>MCP</a> or <a href="/api/agents" style={{ color: '#2EE68A' }}>REST API</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============ PROVISIONING IN PROGRESS ============
  if (user.paid && provisioning) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.buildView}>
            <div className={styles.buildHeader}>
              <div className={styles.buildSpinner}>
                <div className={styles.spinnerRing} />
                <span className={styles.spinnerIcon}>{isFailed ? '❌' : (steps[currentStep]?.icon || '🐳')}</span>
              </div>
              <h1 className={styles.heroTitle}>
                {isFailed ? 'Deploy Failed' : 'Deploying Your Agent...'}
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
                  <span className={styles.terminalTitle}>deploy log</span>
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
                ❌ Deploy failed. Try refreshing or contact support.
              </div>
            )}

            {!isFailed && (
              <p className={styles.waitNote}>
                ⏱️ Usually takes ~10 seconds • This page updates automatically
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ============ FALLBACK: manual deploy button ============
  const handleDeploy = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/provisioning/free-beta', { method: 'POST' })
      if (res.ok) {
        window.location.reload()
      } else {
        const data = await res.json()
        alert(data.message || data.error || 'Failed to deploy')
      }
    } catch {
      alert('Deploy failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.heroTitle}>Welcome, {user.name || user.email?.split('@')[0]}! 🐾</h1>
        <p className={styles.heroSub}>Let's deploy your AI agent</p>
        
        <div className={styles.glassCard}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#2EE68A', marginBottom: '0.5rem' }}>🐳 Your NanoClaw Agent</h2>
            <p style={{ fontSize: '1rem', color: '#8899a6', marginBottom: '0' }}>
              Isolated Docker container • Claude Sonnet 4.5 • Ready in seconds
            </p>
          </div>
          
          <div className={styles.featureGrid}>
            <div className={styles.featureItem}>🐳 Docker container (isolated)</div>
            <div className={styles.featureItem}>🧠 Claude Sonnet 4.5</div>
            <div className={styles.featureItem}>🔌 REST API + MCP</div>
            <div className={styles.featureItem}>✏️ Custom personality</div>
            <div className={styles.featureItem}>📡 Telegram / Slack / Web</div>
            <div className={styles.featureItem}>🔒 Private workspace</div>
          </div>
          
          <button className={styles.ctaPrimary} onClick={handleDeploy} disabled={loading} style={{ width: '100%', marginTop: '1.5rem' }}>
            {loading ? 'Deploying...' : '🚀 Deploy My Agent'}
          </button>
          
          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#555' }}>
            Free beta • No credit card • ~10 seconds
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
