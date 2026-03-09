'use client'

import { useEffect, useState } from 'react'

export default function AuthSuccessPage() {
  const [status, setStatus] = useState<'checking' | 'success' | 'pending'>('checking')
  
  useEffect(() => {
    // Check if tokens were captured
    fetch('/api/x-auth/status')
      .then(r => r.json())
      .then(data => setStatus(data.hasTokens ? 'success' : 'pending'))
      .catch(() => setStatus('pending'))
  }, [])
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#fff',
      padding: '20px',
      textAlign: 'center',
    }}>
      <div>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>
          {status === 'success' ? '🎉' : status === 'checking' ? '⏳' : '✅'}
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
          {status === 'success' ? 'X Posting Authorized!' : 'Logged In Successfully!'}
        </h1>
        <p style={{ color: '#aaa', fontSize: '16px', maxWidth: '400px', margin: '0 auto 32px' }}>
          {status === 'success' 
            ? 'Clawdet can now post to X on your behalf. Go back to Telegram and tell Clawdet to post!'
            : 'You\'re signed in. Clawdet will be able to post on your behalf shortly.'
          }
        </p>
        <a href="/dashboard" style={{
          display: 'inline-block',
          background: '#1d9bf0',
          color: '#fff',
          borderRadius: '9999px',
          padding: '12px 32px',
          fontSize: '16px',
          textDecoration: 'none',
        }}>
          Go to Dashboard →
        </a>
      </div>
    </div>
  )
}
