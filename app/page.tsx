'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import styles from './home.module.css'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLogin, setIsLogin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!isLogin) {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Registration failed')
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        window.location.href = '/dashboard'
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Hero */}
        <div className={styles.hero}>
          <span className={styles.logoIcon}>🐾</span>
          <h1 className={styles.heroTitle}>
            Get Your Free
            <br />
            <span className={styles.heroGreen}>AI Agent</span>
          </h1>
          <p className={styles.heroDesc}>
            Your own NanoClaw AI in seconds. Free.
          </p>

          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>~2s</span>
              <span className={styles.heroStatLabel}>deploy</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>Free</span>
              <span className={styles.heroStatLabel}>beta</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>API</span>
              <span className={styles.heroStatLabel}>+ MCP</span>
            </div>
          </div>
        </div>

        {/* Signup Form */}
        <div className={styles.formCard}>
          {error && <div className={styles.error}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            {!isLogin && (
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className={styles.input}
                required={!isLogin}
                disabled={loading}
              />
            )}
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              className={styles.input}
              required
              disabled={loading}
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={isLogin ? 'Password' : 'Password (min 8 chars)'}
              className={styles.input}
              required
              minLength={8}
              disabled={loading}
            />
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Please wait...' : (isLogin ? 'Log In' : '🚀 Create My Agent — Free')}
            </button>
          </form>

          <button
            onClick={() => signIn('twitter', { callbackUrl: '/dashboard' })}
            className={styles.xBtn}
            disabled={loading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Continue with X
          </button>

          <p className={styles.toggle}>
            {isLogin ? (
              <>No account? <button onClick={() => setIsLogin(false)}>Sign up</button></>
            ) : (
              <>Have an account? <button onClick={() => setIsLogin(true)}>Log in</button></>
            )}
          </p>
        </div>

        {/* What You Get */}
        <div className={styles.features}>
          <div className={styles.feature}>
            <span>🐳</span>
            <div>
              <strong>Docker Container</strong>
              <p>Isolated agent, own workspace</p>
            </div>
          </div>
          <div className={styles.feature}>
            <span>🧠</span>
            <div>
              <strong>Claude Sonnet 4.5</strong>
              <p>Latest AI model built-in</p>
            </div>
          </div>
          <div className={styles.feature}>
            <span>🔌</span>
            <div>
              <strong>REST API + MCP</strong>
              <p>Integrate anywhere</p>
            </div>
          </div>
          <div className={styles.feature}>
            <span>📡</span>
            <div>
              <strong>Telegram / Slack / Web</strong>
              <p>Connect any channel</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          <a href="/nanofleets">NanoFleets for Teams</a>
          <span>·</span>
          <a href="https://github.com/qwibitai/nanoclaw" target="_blank" rel="noopener">NanoClaw</a>
        </footer>
      </div>
    </div>
  )
}
