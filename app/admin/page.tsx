'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './admin.module.css'

interface Stats {
  totalUsers: number
  paidUsers: number
  provisionedInstances: number
  pendingProvisioning: number
  freeBetaRemaining: number
  recentUsers: Array<{
    id: string
    username: string
    createdAt: string
    paid: boolean
    provisioningStatus?: string
  }>
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (res.ok) {
        const data = await res.json()
        setStats(data)
        setAuthenticated(true)
        localStorage.setItem('adminToken', token)
      } else {
        setError('Invalid admin token')
      }
    } catch (err) {
      setError('Failed to authenticate')
    }
  }

  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken')
    if (savedToken) {
      setToken(savedToken)
      fetchStats(savedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchStats = async (authToken: string) => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      
      if (res.ok) {
        const data = await res.json()
        setStats(data)
        setAuthenticated(true)
      } else {
        localStorage.removeItem('adminToken')
        setAuthenticated(false)
      }
    } catch (err) {
      setError('Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setAuthenticated(false)
    setStats(null)
    setToken('')
  }

  if (loading) {
    return <div className={styles.container}>Loading...</div>
  }

  if (!authenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.loginCard}>
          <h1>Admin Dashboard</h1>
          <form onSubmit={handleAuth}>
            <input
              type="password"
              placeholder="Admin Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className={styles.input}
              autoFocus
            />
            <button type="submit" className={styles.button}>Login</button>
          </form>
          {error && <p className={styles.error}>{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Admin Dashboard</h1>
        <div className={styles.actions}>
          <button onClick={() => fetchStats(token)} className={styles.refreshButton}>
            🔄 Refresh
          </button>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      {stats && (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.totalUsers}</div>
              <div className={styles.statLabel}>Total Users</div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.paidUsers}</div>
              <div className={styles.statLabel}>Paid Users</div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.provisionedInstances}</div>
              <div className={styles.statLabel}>Active Instances</div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.freeBetaRemaining}/20</div>
              <div className={styles.statLabel}>Free Beta Spots</div>
            </div>
          </div>

          <div className={styles.section}>
            <h2>Recent Users</h2>
            <div className={styles.table}>
              <table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Created</th>
                    <th>Status</th>
                    <th>Provisioning</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentUsers.map(user => (
                    <tr key={user.id}>
                      <td>@{user.username}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>{user.paid ? '✅ Paid' : '⏳ Trial'}</td>
                      <td>{user.provisioningStatus || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.section}>
            <h2>Quick Actions</h2>
            <div className={styles.quickActions}>
              <a href="/admin/feedback" className={styles.actionButton}>
                📝 View Feedback
              </a>
              <a href="https://cloud.hetzner.com" target="_blank" className={styles.actionButton}>
                🖥️ Hetzner Dashboard
              </a>
              <a href="https://dash.cloudflare.com" target="_blank" className={styles.actionButton}>
                ☁️ Cloudflare Dashboard
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
