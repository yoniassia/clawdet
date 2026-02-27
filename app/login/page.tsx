'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function LoginPage() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        login,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email/username or password')
      } else {
        window.location.href = '/dashboard'
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleXAuth = () => {
    signIn('twitter', { callbackUrl: '/dashboard' })
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={styles.logo}>🐾 Clawdet</span>
          </Link>
        </div>

        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>Sign in to your personal AI instance</p>

        {error && <div style={styles.error}>⚠️ {error}</div>}

        <button onClick={handleXAuth} style={styles.xButton} disabled={isLoading}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          Sign in with X
        </button>

        <div style={styles.divider}><span style={{ padding: '0 16px', background: '#111', color: '#888' }}>or</span></div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={styles.label}>Email or Username</label>
            <input
              type="text"
              value={login}
              onChange={e => setLogin(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={isLoading}
              style={styles.input}
            />
          </div>
          <div>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
              required
              disabled={isLoading}
              style={styles.input}
            />
          </div>
          <button type="submit" style={styles.submitButton} disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: '#888', fontSize: 14 }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" style={{ color: '#2EE68A', textDecoration: 'none', fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: '#0a0a0a', fontFamily: 'system-ui, sans-serif' },
  card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 48, maxWidth: 480, width: '100%' },
  logo: { fontSize: 32, fontWeight: 900, background: 'linear-gradient(135deg, #2EE68A 0%, #1db954 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  title: { fontSize: 28, fontWeight: 700, color: '#e0e0e0', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#888', textAlign: 'center', marginBottom: 32 },
  error: { background: 'rgba(244,67,54,0.1)', border: '1px solid rgba(244,67,54,0.3)', color: '#f44336', padding: '12px 16px', borderRadius: 8, marginBottom: 24, fontSize: 14 },
  xButton: { width: '100%', background: 'rgba(255,255,255,0.05)', color: '#e0e0e0', border: '1px solid rgba(255,255,255,0.08)', padding: '14px 24px', borderRadius: 12, fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer' },
  divider: { display: 'flex', alignItems: 'center', textAlign: 'center', margin: '24px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  label: { color: '#e0e0e0', fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 },
  input: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '12px 16px', color: '#e0e0e0', fontSize: 16, outline: 'none', boxSizing: 'border-box' as const },
  submitButton: { width: '100%', background: 'linear-gradient(135deg, #2EE68A 0%, #1db954 100%)', color: '#000', border: 'none', padding: '14px 24px', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 8 },
}
