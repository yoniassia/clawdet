'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface AdminUser {
  id: string
  email: string | null
  username: string | null
  name: string | null
  x_username: string | null
  role: string
  paid: boolean
  provisioning_status: string | null
  instance_url: string | null
  disabled: boolean
  created_at: number
  has_password: boolean
  has_x: boolean
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const router = useRouter()

  const fetchUsers = async (q?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set('search', q)
      const res = await fetch(`/api/admin/users?${params}`)
      if (res.status === 401 || res.status === 403) { router.push('/login'); return }
      const data = await res.json()
      setUsers(data.users || [])
      setTotal(data.total || 0)
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers(search)
  }

  const togglePaid = async (id: string, currentPaid: boolean) => {
    setActionLoading(id)
    await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paid: !currentPaid }) })
    await fetchUsers(search)
    setActionLoading(null)
  }

  const toggleDisabled = async (id: string, currentDisabled: boolean) => {
    setActionLoading(id)
    await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ disabled: !currentDisabled }) })
    await fetchUsers(search)
    setActionLoading(null)
  }

  const changeRole = async (id: string, role: string) => {
    setActionLoading(id)
    await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) })
    await fetchUsers(search)
    setActionLoading(null)
  }

  const deleteUser = async (id: string) => {
    if (!confirm('Delete this user permanently?')) return
    setActionLoading(id)
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    await fetchUsers(search)
    setActionLoading(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e0e0e0', fontFamily: 'system-ui', padding: '24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Link href="/dashboard" style={{ color: '#888', textDecoration: 'none', fontSize: 14 }}>← Dashboard</Link>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: '8px 0 0' }}>User Management</h1>
            <p style={{ color: '#888', fontSize: 14 }}>{total} users total</p>
          </div>
          <div>
            <Link href="/admin/health" style={{ padding: '10px 18px', background: '#16181c', border: '1px solid #2f3336', borderRadius: 8, color: '#2EE68A', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
              🏥 Instance Health
            </Link>
          </div>
        </div>

        <form onSubmit={handleSearch} style={{ marginBottom: 24, display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by username, email, or name..."
            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 16px', color: '#e0e0e0', fontSize: 14, outline: 'none' }}
          />
          <button type="submit" style={{ background: 'linear-gradient(135deg, #2EE68A, #1db954)', color: '#000', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}>Search</button>
        </form>

        {loading ? (
          <p style={{ color: '#888' }}>Loading...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Username', 'Email', 'Auth', 'Role', 'Paid', 'Status', 'Created', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 8px', color: '#888', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', opacity: u.disabled ? 0.5 : 1 }}>
                    <td style={{ padding: '12px 8px' }}>{u.username || u.x_username || '—'}</td>
                    <td style={{ padding: '12px 8px', color: '#888' }}>{u.email || '—'}</td>
                    <td style={{ padding: '12px 8px' }}>
                      {u.has_password && <span style={{ background: 'rgba(46,230,138,0.1)', color: '#2EE68A', padding: '2px 8px', borderRadius: 4, fontSize: 12, marginRight: 4 }}>✉️</span>}
                      {u.has_x && <span style={{ background: 'rgba(255,255,255,0.05)', color: '#e0e0e0', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>𝕏</span>}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <select
                        value={u.role}
                        onChange={e => changeRole(u.id, e.target.value)}
                        disabled={actionLoading === u.id}
                        style={{ background: '#1a1a1a', color: '#e0e0e0', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, padding: '4px 8px', fontSize: 12 }}
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{ color: u.paid ? '#2EE68A' : '#888' }}>{u.paid ? '✓' : '✗'}</span>
                    </td>
                    <td style={{ padding: '12px 8px', color: '#888', fontSize: 12 }}>{u.provisioning_status || '—'}</td>
                    <td style={{ padding: '12px 8px', color: '#888', fontSize: 12 }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => togglePaid(u.id, u.paid)} disabled={actionLoading === u.id} style={btnStyle}>
                          {u.paid ? 'Unpay' : 'Pay'}
                        </button>
                        <button onClick={() => toggleDisabled(u.id, u.disabled)} disabled={actionLoading === u.id} style={btnStyle}>
                          {u.disabled ? 'Enable' : 'Disable'}
                        </button>
                        <button onClick={() => deleteUser(u.id)} disabled={actionLoading === u.id} style={{ ...btnStyle, color: '#f44336' }}>
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

const btnStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, padding: '4px 8px', color: '#e0e0e0', fontSize: 11, cursor: 'pointer' }
