'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Agent {
  containerId: string
  containerName: string
  userId: string
  username: string
  port: number
  token: string
  status: 'running' | 'stopped' | 'error' | 'not_found'
  healthy: boolean
  memoryMb?: number
  uptime?: string
  instanceUrl?: string
  createdAt?: string
}

interface FleetStats {
  totalAgents: number
  runningAgents: number
  stoppedAgents: number
  totalMemoryMb: number
  availableSlots: number
}

export default function FleetDashboard() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [stats, setStats] = useState<FleetStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newClaudeMd, setNewClaudeMd] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [createdToken, setCreatedToken] = useState<string | null>(null)

  const fetchFleet = useCallback(async () => {
    try {
      const res = await fetch('/api/fleet')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setAgents(data.agents || [])
      setStats(data.stats || null)
      setError('')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFleet()
    const interval = setInterval(fetchFleet, 15000)
    return () => clearInterval(interval)
  }, [fetchFleet])

  const createAgent = async () => {
    if (!newUsername.trim()) return
    setCreating(true)
    setCreatedToken(null)
    try {
      const res = await fetch('/api/fleet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername.trim(),
          claudeMd: newClaudeMd.trim() || undefined
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCreatedToken(data.fullToken)
      setNewUsername('')
      setNewClaudeMd('')
      fetchFleet()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setCreating(false)
    }
  }

  const agentAction = async (username: string, action: 'start' | 'stop' | 'remove') => {
    setActionLoading(`${username}-${action}`)
    try {
      if (action === 'remove') {
        if (!confirm(`Remove agent "${username}"? This stops the container.`)) return
        await fetch(`/api/fleet?username=${username}`, { method: 'DELETE' })
      } else {
        await fetch('/api/fleet', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, action })
        })
      }
      await fetchFleet()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setActionLoading(null)
    }
  }

  const statusColor = (s: string, healthy: boolean) => {
    if (s === 'running' && healthy) return '#2EE68A'
    if (s === 'running') return '#ffd93d'
    if (s === 'stopped') return '#8899a6'
    return '#f91880'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e7e9ea', padding: '24px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>🐳</span>
            <span style={{ background: 'linear-gradient(135deg, #2EE68A 0%, #1d9bf0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              NanoFleet Dashboard
            </span>
          </h1>
          <p style={{ color: '#8899a6', margin: '4px 0 0', fontSize: '14px' }}>Docker agent fleet management</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/admin" style={{ padding: '8px 16px', background: '#16181c', border: '1px solid #2f3336', borderRadius: '8px', color: '#e7e9ea', textDecoration: 'none', fontSize: '14px' }}>
            ← Admin
          </Link>
          <button onClick={fetchFleet} style={{ padding: '8px 16px', background: '#16181c', border: '1px solid #2f3336', borderRadius: '8px', color: '#e7e9ea', cursor: 'pointer', fontSize: '14px' }}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(249,24,128,0.1)', border: '1px solid rgba(249,24,128,0.3)', borderRadius: '10px', color: '#f91880', marginBottom: '20px', fontSize: '14px' }}>
          ❌ {error}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Total Agents', value: stats.totalAgents, icon: '🤖', color: '#1d9bf0' },
            { label: 'Running', value: stats.runningAgents, icon: '🟢', color: '#2EE68A' },
            { label: 'Stopped', value: stats.stoppedAgents, icon: '⏸️', color: '#8899a6' },
            { label: 'RAM Used', value: `${stats.totalMemoryMb}MB`, icon: '💾', color: '#ffd93d' },
            { label: 'Available Slots', value: stats.availableSlots, icon: '📦', color: '#1d9bf0' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '20px', background: '#16181c', border: '1px solid #2f3336', borderRadius: '14px' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#8899a6', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Create Agent */}
      <div style={{ padding: '24px', background: '#16181c', border: '1px solid #2f3336', borderRadius: '14px', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700 }}>➕ Create New Agent</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#8899a6', marginBottom: '4px' }}>Username *</label>
            <input
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              placeholder="e.g. john-doe"
              style={{ width: '100%', padding: '10px 14px', background: '#0a0a0a', border: '1px solid #2f3336', borderRadius: '8px', color: '#e7e9ea', fontSize: '14px', outline: 'none' }}
              onKeyDown={e => e.key === 'Enter' && createAgent()}
            />
          </div>
          <div style={{ flex: '2', minWidth: '300px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#8899a6', marginBottom: '4px' }}>Custom CLAUDE.md (optional)</label>
            <input
              value={newClaudeMd}
              onChange={e => setNewClaudeMd(e.target.value)}
              placeholder="Custom personality... (leave empty for default)"
              style={{ width: '100%', padding: '10px 14px', background: '#0a0a0a', border: '1px solid #2f3336', borderRadius: '8px', color: '#e7e9ea', fontSize: '14px', outline: 'none' }}
            />
          </div>
          <button
            onClick={createAgent}
            disabled={creating || !newUsername.trim()}
            style={{ padding: '10px 24px', background: '#2EE68A', color: '#0a0a0a', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: creating ? 'wait' : 'pointer', opacity: creating || !newUsername.trim() ? 0.5 : 1 }}
          >
            {creating ? '⏳ Creating...' : '🚀 Deploy Agent'}
          </button>
        </div>
        {createdToken && (
          <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(46,230,138,0.08)', border: '1px solid rgba(46,230,138,0.2)', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#2EE68A', marginBottom: '4px', fontWeight: 600 }}>✅ Agent Created! Gateway Token (save this):</div>
            <code style={{ fontSize: '12px', color: '#e7e9ea', wordBreak: 'break-all' }}>{createdToken}</code>
          </div>
        )}
      </div>

      {/* Agent List */}
      <div style={{ background: '#16181c', border: '1px solid #2f3336', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #2f3336', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>🤖 Fleet Agents</h3>
          <span style={{ fontSize: '12px', color: '#8899a6' }}>Auto-refreshes every 15s</span>
        </div>
        
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#8899a6' }}>Loading fleet...</div>
        ) : agents.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#8899a6' }}>No agents yet. Create one above! ☝️</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2f3336' }}>
                {['Status', 'Agent', 'Port', 'Container', 'RAM', 'Token', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', color: '#8899a6', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agents.map(agent => (
                <tr key={agent.username} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: statusColor(agent.status, agent.healthy) }} />
                      <span style={{ fontSize: '12px', color: statusColor(agent.status, agent.healthy) }}>
                        {agent.status === 'running' && agent.healthy ? 'Healthy' : agent.status}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{agent.username}</div>
                    <div style={{ fontSize: '11px', color: '#8899a6' }}>{agent.userId}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', fontFamily: 'monospace' }}>{agent.port}</td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', fontFamily: 'monospace', color: '#8899a6' }}>{agent.containerName}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>{agent.memoryMb ? `${agent.memoryMb}MB` : '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', fontFamily: 'monospace', color: '#8899a6' }}>{agent.token}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {agent.status === 'running' ? (
                        <button
                          onClick={() => agentAction(agent.username, 'stop')}
                          disabled={actionLoading === `${agent.username}-stop`}
                          style={{ padding: '4px 10px', background: 'rgba(255,217,61,0.1)', border: '1px solid rgba(255,217,61,0.3)', borderRadius: '6px', color: '#ffd93d', cursor: 'pointer', fontSize: '12px' }}
                        >
                          ⏸ Stop
                        </button>
                      ) : (
                        <button
                          onClick={() => agentAction(agent.username, 'start')}
                          disabled={actionLoading === `${agent.username}-start`}
                          style={{ padding: '4px 10px', background: 'rgba(46,230,138,0.1)', border: '1px solid rgba(46,230,138,0.3)', borderRadius: '6px', color: '#2EE68A', cursor: 'pointer', fontSize: '12px' }}
                        >
                          ▶ Start
                        </button>
                      )}
                      <button
                        onClick={() => agentAction(agent.username, 'remove')}
                        disabled={actionLoading === `${agent.username}-remove`}
                        style={{ padding: '4px 10px', background: 'rgba(249,24,128,0.1)', border: '1px solid rgba(249,24,128,0.3)', borderRadius: '6px', color: '#f91880', cursor: 'pointer', fontSize: '12px' }}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
