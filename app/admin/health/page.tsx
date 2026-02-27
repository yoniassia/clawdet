'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface InstanceHealth {
  userId: string
  username: string
  instanceUrl: string
  vpsIp: string | null
  httpStatus: number | null
  gatewayStatus: 'up' | 'down' | 'unknown'
  responseTimeMs: number | null
  checkedAt: string
  error?: string
}

interface HealthReport {
  checkedAt: string
  totalInstances: number
  healthy: number
  unhealthy: number
  instances: InstanceHealth[]
}

export default function HealthDashboard() {
  const [report, setReport] = useState<HealthReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(false)

  const fetchHealth = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/health')
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setError('Admin access required')
          return
        }
        throw new Error(`HTTP ${res.status}`)
      }
      const data = await res.json()
      setReport(data)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealth()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(fetchHealth, 60000) // every 60s
    return () => clearInterval(interval)
  }, [autoRefresh])

  const statusIcon = (h: InstanceHealth) => {
    if (h.httpStatus === 200 && h.gatewayStatus === 'up') return '🟢'
    if (h.httpStatus === 200) return '🟡'
    return '🔴'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#e7e9ea',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <Link href="/admin/users" style={{ color: '#71767b', textDecoration: 'none', fontSize: 14 }}>
              ← Admin
            </Link>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: '8px 0 0' }}>
              🏥 Instance Health Monitor
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <label style={{ fontSize: 14, color: '#71767b', display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              Auto-refresh
            </label>
            <button
              onClick={fetchHealth}
              disabled={loading}
              style={{
                padding: '10px 20px',
                background: '#2EE68A',
                color: '#0a0a0a',
                border: 'none',
                borderRadius: 8,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Checking...' : '🔄 Refresh'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            padding: 16,
            background: 'rgba(255, 59, 48, 0.1)',
            border: '1px solid rgba(255, 59, 48, 0.3)',
            borderRadius: 12,
            color: '#ff3b30',
            marginBottom: 24,
          }}>
            ⚠️ {error}
          </div>
        )}

        {report && (
          <>
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
              <SummaryCard label="Total Instances" value={report.totalInstances} color="#1d9bf0" />
              <SummaryCard label="Healthy" value={report.healthy} color="#2EE68A" />
              <SummaryCard label="Unhealthy" value={report.unhealthy} color={report.unhealthy > 0 ? '#ff3b30' : '#71767b'} />
              <SummaryCard
                label="Last Check"
                value={new Date(report.checkedAt).toLocaleTimeString()}
                color="#71767b"
                small
              />
            </div>

            {/* Instance Table */}
            {report.instances.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#71767b' }}>
                No provisioned instances yet
              </div>
            ) : (
              <div style={{
                background: '#16181c',
                border: '1px solid #2f3336',
                borderRadius: 16,
                overflow: 'hidden',
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #2f3336' }}>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>User</th>
                      <th style={thStyle}>Instance</th>
                      <th style={thStyle}>HTTP</th>
                      <th style={thStyle}>Gateway</th>
                      <th style={thStyle}>Response</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.instances.map((inst) => (
                      <tr key={inst.userId} style={{ borderBottom: '1px solid #2f3336' }}>
                        <td style={tdStyle}>{statusIcon(inst)}</td>
                        <td style={tdStyle}>
                          <strong>{inst.username}</strong>
                          {inst.vpsIp && <div style={{ fontSize: 12, color: '#71767b' }}>{inst.vpsIp}</div>}
                        </td>
                        <td style={tdStyle}>
                          <a
                            href={inst.instanceUrl}
                            target="_blank"
                            rel="noopener"
                            style={{ color: '#1d9bf0', textDecoration: 'none' }}
                          >
                            {inst.instanceUrl.replace('https://', '')}
                          </a>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ color: inst.httpStatus === 200 ? '#2EE68A' : '#ff3b30' }}>
                            {inst.httpStatus ?? '—'}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: 20,
                            fontSize: 13,
                            fontWeight: 600,
                            background: inst.gatewayStatus === 'up'
                              ? 'rgba(46, 230, 138, 0.15)'
                              : inst.gatewayStatus === 'down'
                              ? 'rgba(255, 59, 48, 0.15)'
                              : 'rgba(113, 118, 123, 0.15)',
                            color: inst.gatewayStatus === 'up'
                              ? '#2EE68A'
                              : inst.gatewayStatus === 'down'
                              ? '#ff3b30'
                              : '#71767b',
                          }}>
                            {inst.gatewayStatus}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          {inst.responseTimeMs != null ? `${inst.responseTimeMs}ms` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '14px 16px',
  fontSize: 13,
  fontWeight: 600,
  color: '#71767b',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}

const tdStyle: React.CSSProperties = {
  padding: '14px 16px',
  fontSize: 14,
}

function SummaryCard({ label, value, color, small }: { label: string; value: string | number; color: string; small?: boolean }) {
  return (
    <div style={{
      padding: 20,
      background: '#16181c',
      border: '1px solid #2f3336',
      borderRadius: 12,
    }}>
      <div style={{ fontSize: 13, color: '#71767b', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: small ? 16 : 32, fontWeight: 800, color }}>{value}</div>
    </div>
  )
}
