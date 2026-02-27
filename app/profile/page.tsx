'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [accounts, setAccounts] = useState<Array<{ provider: string }>>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (!data.authenticated) { router.push('/login'); return }
      setUser(data.user)
      setName(data.user.name || '')
      setEmail(data.user.email || '')
      setLoading(false)
    })
    fetch('/api/profile/accounts').then(r => r.json()).then(data => {
      if (data.accounts) setAccounts(data.accounts)
    }).catch(() => {})
  }, [router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, currentPassword: currentPassword || undefined, newPassword: newPassword || undefined }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage('Profile updated!')
        setCurrentPassword('')
        setNewPassword('')
      } else {
        setMessage(data.error || 'Failed to update')
      }
    } catch { setMessage('Error saving') }
    setSaving(false)
  }

  const linkX = () => signIn('twitter', { callbackUrl: '/profile' })

  if (loading) return <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>Loading...</div>

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e0e0e0', fontFamily: 'system-ui', padding: 24 }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <Link href="/dashboard" style={{ color: '#888', textDecoration: 'none', fontSize: 14 }}>← Dashboard</Link>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '12px 0 32px' }}>Profile</h1>

        {message && <div style={{ background: message.includes('!') ? 'rgba(46,230,138,0.1)' : 'rgba(244,67,54,0.1)', border: `1px solid ${message.includes('!') ? 'rgba(46,230,138,0.3)' : 'rgba(244,67,54,0.3)'}`, color: message.includes('!') ? '#2EE68A' : '#f44336', padding: '12px 16px', borderRadius: 8, marginBottom: 24, fontSize: 14 }}>{message}</div>}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={cardStyle}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Basic Info</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Name</label>
              <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Change Password</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Current Password</label>
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Leave blank to keep current" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 8 characters" minLength={8} style={inputStyle} />
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Linked Accounts</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>𝕏 Twitter/X</span>
              {accounts.some(a => a.provider === 'twitter') ? (
                <span style={{ color: '#2EE68A', fontSize: 14 }}>✓ Connected</span>
              ) : (
                <button type="button" onClick={linkX} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 16px', color: '#e0e0e0', cursor: 'pointer', fontSize: 13 }}>Link X Account</button>
              )}
            </div>
          </div>

          <button type="submit" disabled={saving} style={{ background: 'linear-gradient(135deg, #2EE68A, #1db954)', color: '#000', border: 'none', borderRadius: 12, padding: '14px 24px', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}

const cardStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 24 }
const labelStyle: React.CSSProperties = { color: '#888', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }
const inputStyle: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 14px', color: '#e0e0e0', fontSize: 15, outline: 'none', boxSizing: 'border-box' }
