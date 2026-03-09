'use client'

import { signIn } from 'next-auth/react'

export default function AuthorizeXPage() {
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
    }}>
      <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🐾</div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px' }}>
          Authorize Clawdet to Post on X
        </h1>
        <p style={{ color: '#aaa', fontSize: '16px', lineHeight: 1.6, marginBottom: '32px' }}>
          Click below to connect your X account. You&apos;ll be redirected to X to approve, then back here.
        </p>
        
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '32px',
          textAlign: 'left',
        }}>
          <div style={{ marginBottom: '8px' }}>✅ Read your profile</div>
          <div style={{ marginBottom: '8px' }}>✅ Read your tweets</div>
          <div style={{ marginBottom: '8px', color: '#1d9bf0', fontWeight: 600 }}>✍️ Post tweets on your behalf</div>
        </div>
        
        <button
          onClick={() => signIn('twitter', { callbackUrl: '/authorize-x/success' })}
          style={{
            display: 'block',
            background: '#1d9bf0',
            color: '#fff',
            border: 'none',
            borderRadius: '9999px',
            padding: '16px 48px',
            fontSize: '18px',
            fontWeight: 600,
            cursor: 'pointer',
            width: '100%',
          }}
        >
          🐦 Authorize with X
        </button>
        
        <p style={{ color: '#555', fontSize: '12px', marginTop: '24px' }}>
          OAuth 2.0 · Tokens stored on your server only
        </p>
      </div>
    </div>
  )
}
