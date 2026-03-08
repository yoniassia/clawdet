'use client';
import { useState } from 'react';
import Link from 'next/link';

/* ── colour tokens ────────────────────────────────── */
const G = '#2EE68A';
const BG = '#0a0a0a';
const CARD = 'rgba(22,27,34,.85)';
const BORDER = '#30363d';
const MUTED = '#8b949e';
const TEXT = '#e6edf3';

/* ── reusable style helpers ───────────────────────── */
const glass = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  background: CARD,
  border: `1px solid ${BORDER}`,
  borderRadius: 16,
  padding: 28,
  backdropFilter: 'blur(12px)',
  ...extra,
});

const badge = (color = G): React.CSSProperties => ({
  display: 'inline-block',
  padding: '3px 10px',
  borderRadius: 20,
  fontSize: '.7rem',
  fontWeight: 700,
  letterSpacing: '.04em',
  color: BG,
  background: color,
});

/* ── data ─────────────────────────────────────────── */
const currentFleet = [
  { name: 'nanoclaw-yoni', port: 18810, status: 'running', mem: '142 MB', cpu: '0.3%', uptime: '14d 6h' },
  { name: 'nanoclaw-demo', port: 18811, status: 'running', mem: '98 MB', cpu: '0.1%', uptime: '12d 2h' },
  { name: 'nanoclaw-trial-1', port: 18812, status: 'running', mem: '112 MB', cpu: '0.2%', uptime: '8d 14h' },
  { name: 'nanoclaw-trial-2', port: 18813, status: 'running', mem: '87 MB', cpu: '0.1%', uptime: '8d 14h' },
  { name: 'nanoclaw-trial-3', port: 18814, status: 'running', mem: '105 MB', cpu: '0.2%', uptime: '6d 9h' },
  { name: 'nanoclaw-trial-4', port: 18815, status: 'running', mem: '91 MB', cpu: '0.1%', uptime: '5d 3h' },
  { name: 'nanoclaw-trial-5', port: 18816, status: 'running', mem: '134 MB', cpu: '0.2%', uptime: '3d 18h' },
  { name: 'nanoclaw-trial-6', port: 18817, status: 'idle', mem: '64 MB', cpu: '0.0%', uptime: '1d 2h' },
];

const phases = [
  {
    phase: 'Phase 1',
    title: 'Observability Layer',
    weeks: 'Weeks 1–3',
    color: '#58a6ff',
    items: [
      'Deploy Prometheus + cAdvisor on Hetzner node',
      'Grafana dashboards: per-container CPU / RAM / net',
      'Health-check endpoint poller → alert on 3× miss',
      'Centralised log aggregation (Loki + Promtail)',
      'Integrate metrics API into Clawdet dashboard',
    ],
  },
  {
    phase: 'Phase 2',
    title: 'Control Plane (Paperclip)',
    weeks: 'Weeks 4–7',
    color: G,
    items: [
      'Build Paperclip control-plane service (TypeScript)',
      'Agent registry: CRUD for agent configs & secrets',
      'Lifecycle API: create / start / stop / restart / destroy',
      'Rolling-update orchestrator (blue-green per agent)',
      'REST + WebSocket API for real-time status',
      'Integrate with existing provisioner-docker.ts',
    ],
  },
  {
    phase: 'Phase 3',
    title: 'Fleet Dashboard',
    weeks: 'Weeks 8–10',
    color: '#d2a8ff',
    items: [
      'Live fleet map with container states',
      'Per-agent log viewer (streaming)',
      'One-click scale: provision new agent from template',
      'Bulk operations: restart-all, rolling image update',
      'Resource budgets & quota enforcement',
    ],
  },
  {
    phase: 'Phase 4',
    title: 'Multi-Node & Auto-Scale',
    weeks: 'Weeks 11–16',
    color: '#f78166',
    items: [
      'Multi-node agent: register & health-check Hetzner nodes',
      'Scheduler: bin-pack agents across nodes (RAM-aware)',
      'Auto-scale: spawn new Hetzner node when capacity < 20%',
      'Cross-node networking (WireGuard mesh)',
      'Disaster recovery: snapshot + restore agent state',
      'Terraform / Pulumi IaC for node provisioning',
    ],
  },
];

const featureMatrix: { feature: string; current: string; paperclip: string; }[] = [
  { feature: 'Agent lifecycle (start / stop)', current: 'Manual docker CLI', paperclip: 'REST API + Dashboard' },
  { feature: 'Health monitoring', current: 'None — manual curl', paperclip: 'Auto health-check + alerts' },
  { feature: 'Resource metrics', current: 'docker stats', paperclip: 'Prometheus + Grafana' },
  { feature: 'Log access', current: 'docker logs per SSH', paperclip: 'Centralised Loki + UI viewer' },
  { feature: 'Rolling updates', current: 'Script per container', paperclip: 'Blue-green orchestrator' },
  { feature: 'Scaling', current: 'Manual provisioner call', paperclip: 'One-click + auto-scale' },
  { feature: 'Multi-server', current: '❌ Single node only', paperclip: 'Node registry + scheduler' },
  { feature: 'Secrets management', current: '.env files on disk', paperclip: 'Encrypted vault + rotate' },
  { feature: 'Agent templates', current: 'Dockerfile + CLAUDE.md', paperclip: 'Template registry + versioning' },
  { feature: 'Disaster recovery', current: '❌ None', paperclip: 'Snapshot + auto-restore' },
];

/* ── tab type ─────────────────────────────────────── */
type Tab = 'overview' | 'architecture' | 'roadmap' | 'matrix';

export default function FleetMgmtPage() {
  const [tab, setTab] = useState<Tab>('overview');

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TEXT, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" }}>
      {/* ─── Nav ─────────────────────────────────── */}
      <nav style={{ background: '#161b22', borderBottom: `1px solid ${BORDER}`, padding: '12px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: G, fontWeight: 700, fontSize: '1.1rem', textDecoration: 'none' }}>🐾 Clawdet</Link>
          {[
            ['/dashboard', 'Dashboard'],
            ['/nanofleets', 'NanoFleets'],
            ['/tech', 'Tech'],
            ['/fleetmgmt', 'Fleet Mgmt'],
          ].map(([href, label]) => (
            <Link key={href} href={href} style={{
              color: href === '/fleetmgmt' ? G : MUTED,
              fontSize: '.875rem',
              padding: '6px 12px',
              borderRadius: 6,
              textDecoration: 'none',
              fontWeight: href === '/fleetmgmt' ? 600 : 400,
              border: href === '/fleetmgmt' ? `1px solid ${G}` : '1px solid transparent',
              background: href === '/fleetmgmt' ? 'rgba(46,230,138,.08)' : 'transparent',
            }}>{label}</Link>
          ))}
        </div>
      </nav>

      {/* ─── Hero ────────────────────────────────── */}
      <header style={{ textAlign: 'center', padding: '64px 24px 32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: `radial-gradient(circle, rgba(46,230,138,.12) 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <span style={badge()}>FLEET MANAGEMENT PLAN</span>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, margin: '20px 0 12px', lineHeight: 1.15 }}>
          <span style={{ color: G }}>Paperclip</span> × NanoClaw
        </h1>
        <p style={{ color: MUTED, maxWidth: 640, margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
          A control-plane for managing fleets of AI agent containers — from observability and lifecycle management to multi-node scheduling and auto-scale.
        </p>
      </header>

      {/* ─── Tab Bar ─────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 24px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {([
          ['overview', '📡 Current State'],
          ['architecture', '🏗️ Architecture'],
          ['roadmap', '🗺️ Roadmap'],
          ['matrix', '📊 Feature Matrix'],
        ] as [Tab, string][]).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 20px',
            borderRadius: 10,
            border: tab === t ? `1px solid ${G}` : `1px solid ${BORDER}`,
            background: tab === t ? 'rgba(46,230,138,.12)' : 'transparent',
            color: tab === t ? G : MUTED,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '.875rem',
            transition: 'all .2s',
          }}>{label}</button>
        ))}
      </div>

      {/* ─── Content ─────────────────────────────── */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px' }}>

        {/* ── Overview Tab ────────────────────────── */}
        {tab === 'overview' && (
          <div>
            {/* Key stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
              {[
                ['8', 'Running Agents', G],
                ['256 MB', 'RAM / Agent', '#58a6ff'],
                ['18810–18899', 'Port Range', '#d2a8ff'],
                ['1', 'Hetzner Node', '#f78166'],
              ].map(([val, label, c]) => (
                <div key={label} style={glass({ textAlign: 'center', padding: 20 })}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: c as string }}>{val}</div>
                  <div style={{ color: MUTED, fontSize: '.8rem', marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Fleet table */}
            <div style={glass({ overflowX: 'auto' })}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem' }}>🐳 Current Fleet — Hetzner 188.34.197.212</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                    {['Container', 'Port', 'Status', 'Memory', 'CPU', 'Uptime'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: MUTED, fontWeight: 600, fontSize: '.75rem', letterSpacing: '.04em', textTransform: 'uppercase' as const }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentFleet.map(a => (
                    <tr key={a.name} style={{ borderBottom: `1px solid ${BORDER}22` }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 600 }}>{a.name}</td>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#58a6ff' }}>{a.port}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: a.status === 'running' ? G : '#f0883e' }} />
                          {a.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>{a.mem}</td>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>{a.cpu}</td>
                      <td style={{ padding: '10px 12px', color: MUTED }}>{a.uptime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Architecture diagram */}
            <div style={glass({ marginTop: 24 })}>
              <h3 style={{ margin: '0 0 20px', fontSize: '1.1rem' }}>🔧 Current Provisioning Flow</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap', justifyContent: 'center' }}>
                {[
                  ['1️⃣', 'Validate', 'Check port + user uniqueness'],
                  ['→', '', ''],
                  ['2️⃣', 'Container', 'docker run nanoclaw-agent'],
                  ['→', '', ''],
                  ['3️⃣', 'DNS', 'Caddy reverse proxy + SSL'],
                  ['→', '', ''],
                  ['4️⃣', 'Health', 'HTTP health-check polling'],
                ].map(([icon, title, desc], i) => (
                  title ? (
                    <div key={i} style={{
                      background: 'rgba(46,230,138,.06)',
                      border: `1px solid ${BORDER}`,
                      borderRadius: 12,
                      padding: '16px 20px',
                      textAlign: 'center',
                      minWidth: 140,
                      flex: '0 1 auto',
                    }}>
                      <div style={{ fontSize: '1.3rem' }}>{icon}</div>
                      <div style={{ fontWeight: 700, marginTop: 4 }}>{title}</div>
                      <div style={{ color: MUTED, fontSize: '.75rem', marginTop: 4 }}>{desc}</div>
                    </div>
                  ) : (
                    <div key={i} style={{ color: G, fontSize: '1.5rem', padding: '0 8px', fontWeight: 700 }}>→</div>
                  )
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Architecture Tab ────────────────────── */}
        {tab === 'architecture' && (
          <div>
            <div style={glass({ marginBottom: 24 })}>
              <h3 style={{ margin: '0 0 12px' }}>🧩 What is Paperclip?</h3>
              <p style={{ color: MUTED, lineHeight: 1.7, margin: 0 }}>
                <strong style={{ color: TEXT }}>Paperclip</strong> is an AI agent coordination control plane — a TypeScript-based orchestration layer purpose-built for managing fleets of AI agent containers. Unlike generic container orchestrators (Kubernetes, Docker Swarm), Paperclip understands <em>agent-specific</em> concepts: agent identity, memory persistence, model routing, skill registries, and conversation state. It provides a unified API for agent lifecycle management, health monitoring, and fleet-wide operations.
              </p>
            </div>

            {/* Architecture layers */}
            <div style={glass()}>
              <h3 style={{ margin: '0 0 24px' }}>🏗️ Target Architecture — Paperclip + NanoClaw</h3>

              {/* Visual stack */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontFamily: 'monospace', fontSize: '.8rem' }}>
                {[
                  { label: 'Clawdet Dashboard', color: '#d2a8ff', desc: 'Next.js UI — fleet view, logs, metrics, controls' },
                  { label: 'Paperclip Control Plane', color: G, desc: 'Agent registry, lifecycle API, scheduler, rolling updates' },
                  { label: 'Metrics & Observability', color: '#58a6ff', desc: 'Prometheus + Grafana + Loki — per-agent resource & log streaming' },
                  { label: 'Container Runtime', color: '#f78166', desc: 'Docker Engine — nanoclaw-agent / nanoclaw-telegram images' },
                  { label: 'Infrastructure', color: MUTED, desc: 'Hetzner Cloud — VPS nodes, WireGuard mesh, Caddy TLS' },
                ].map((layer, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'stretch',
                    borderRadius: i === 0 ? '12px 12px 0 0' : i === 4 ? '0 0 12px 12px' : 0,
                    overflow: 'hidden',
                    border: `1px solid ${BORDER}`,
                    borderBottom: i < 4 ? 'none' : `1px solid ${BORDER}`,
                  }}>
                    <div style={{
                      width: 6,
                      background: layer.color,
                      flexShrink: 0,
                    }} />
                    <div style={{ padding: '14px 20px', flex: 1, background: 'rgba(255,255,255,.02)' }}>
                      <span style={{ color: layer.color, fontWeight: 700 }}>{layer.label}</span>
                      <span style={{ color: MUTED, marginLeft: 16 }}>{layer.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Data flow */}
              <h4 style={{ margin: '28px 0 16px', color: G }}>Data Flow</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                {[
                  { icon: '📥', title: 'Inbound Request', desc: 'User → Caddy → Agent container (HTTP/WS/Telegram webhook)' },
                  { icon: '🔄', title: 'Control Plane', desc: 'Dashboard → Paperclip API → Docker Engine (lifecycle ops)' },
                  { icon: '📊', title: 'Metrics Pipeline', desc: 'cAdvisor → Prometheus → Grafana | Clawdet Dashboard' },
                  { icon: '📝', title: 'Log Pipeline', desc: 'Container stdout → Promtail → Loki → Dashboard log viewer' },
                  { icon: '💾', title: 'Agent State', desc: 'CLAUDE.md + MEMORY.md → Volume mounts → Snapshot to S3' },
                  { icon: '🔐', title: 'Secrets', desc: 'Vault / SOPS → Injected at container start → Rotated on schedule' },
                ].map(d => (
                  <div key={d.title} style={{ background: 'rgba(255,255,255,.03)', border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16 }}>
                    <div style={{ fontSize: '1.2rem', marginBottom: 6 }}>{d.icon} <strong>{d.title}</strong></div>
                    <div style={{ color: MUTED, fontSize: '.82rem', lineHeight: 1.5 }}>{d.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Paperclip API */}
            <div style={glass({ marginTop: 24 })}>
              <h3 style={{ margin: '0 0 16px' }}>⚡ Paperclip API Surface</h3>
              <div style={{ fontFamily: 'monospace', fontSize: '.82rem', lineHeight: 2.0, color: '#58a6ff' }}>
                {[
                  'POST   /api/agents                 → Create agent from template',
                  'GET    /api/agents                 → List all agents + status',
                  'GET    /api/agents/:id             → Agent details + metrics',
                  'POST   /api/agents/:id/start       → Start agent container',
                  'POST   /api/agents/:id/stop        → Graceful stop',
                  'POST   /api/agents/:id/restart     → Stop + Start',
                  'DELETE /api/agents/:id             → Destroy agent + cleanup',
                  'GET    /api/agents/:id/logs        → Stream container logs',
                  'GET    /api/agents/:id/metrics     → CPU / RAM / network',
                  'POST   /api/fleet/rolling-update   → Update all agents (blue-green)',
                  'GET    /api/nodes                  → List infrastructure nodes',
                  'POST   /api/nodes                  → Register new node',
                  'GET    /api/fleet/status           → Aggregate fleet health',
                ].map(line => (
                  <div key={line} style={{ borderBottom: `1px solid ${BORDER}22`, padding: '2px 0' }}>{line}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Roadmap Tab ─────────────────────────── */}
        {tab === 'roadmap' && (
          <div>
            {/* Timeline */}
            <div style={{ position: 'relative', paddingLeft: 32 }}>
              {/* Vertical line */}
              <div style={{ position: 'absolute', left: 14, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${G}, #58a6ff, #d2a8ff, #f78166)` }} />

              {phases.map((p, i) => (
                <div key={i} style={{ marginBottom: 32, position: 'relative' }}>
                  {/* Dot */}
                  <div style={{
                    position: 'absolute',
                    left: -25,
                    top: 6,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: p.color,
                    border: `3px solid ${BG}`,
                    boxShadow: `0 0 12px ${p.color}44`,
                  }} />

                  <div style={glass()}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                      <span style={badge(p.color)}>{p.phase}</span>
                      <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{p.title}</h3>
                      <span style={{ color: MUTED, fontSize: '.8rem', marginLeft: 'auto' }}>{p.weeks}</span>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 20, color: MUTED, lineHeight: 2 }}>
                      {p.items.map(item => (
                        <li key={item}><span style={{ color: TEXT }}>{item}</span></li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Milestone summary */}
            <div style={glass({ marginTop: 8 })}>
              <h3 style={{ margin: '0 0 16px' }}>🏁 Key Milestones</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                {[
                  { week: 'Week 3', milestone: 'Grafana dashboards live', icon: '📊' },
                  { week: 'Week 7', milestone: 'Paperclip API v1 deployed', icon: '🚀' },
                  { week: 'Week 10', milestone: 'Fleet dashboard with live controls', icon: '🎛️' },
                  { week: 'Week 16', milestone: 'Multi-node auto-scaling fleet', icon: '🌐' },
                ].map(m => (
                  <div key={m.week} style={{ background: 'rgba(255,255,255,.03)', border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{m.icon}</div>
                    <div style={{ fontWeight: 700, color: G, fontSize: '.85rem' }}>{m.week}</div>
                    <div style={{ color: TEXT, fontSize: '.85rem', marginTop: 4 }}>{m.milestone}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Matrix Tab ──────────────────────────── */}
        {tab === 'matrix' && (
          <div>
            <div style={glass({ overflowX: 'auto' })}>
              <h3 style={{ margin: '0 0 16px' }}>📊 Feature Matrix — Current vs Paperclip</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${G}44` }}>
                    <th style={{ textAlign: 'left', padding: '10px 14px', color: MUTED, fontWeight: 700, fontSize: '.75rem', letterSpacing: '.04em', textTransform: 'uppercase' as const }}>Feature</th>
                    <th style={{ textAlign: 'left', padding: '10px 14px', color: '#f78166', fontWeight: 700, fontSize: '.75rem', letterSpacing: '.04em', textTransform: 'uppercase' as const }}>Current State</th>
                    <th style={{ textAlign: 'left', padding: '10px 14px', color: G, fontWeight: 700, fontSize: '.75rem', letterSpacing: '.04em', textTransform: 'uppercase' as const }}>With Paperclip</th>
                  </tr>
                </thead>
                <tbody>
                  {featureMatrix.map((r, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${BORDER}44` }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>{r.feature}</td>
                      <td style={{ padding: '12px 14px', color: '#f78166', fontFamily: 'monospace', fontSize: '.8rem' }}>{r.current}</td>
                      <td style={{ padding: '12px 14px', color: G, fontFamily: 'monospace', fontSize: '.8rem' }}>{r.paperclip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cost estimate */}
            <div style={glass({ marginTop: 24 })}>
              <h3 style={{ margin: '0 0 16px' }}>💰 Estimated Infrastructure Additions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                {[
                  { item: 'Prometheus + Grafana', cost: '€0', note: 'Self-hosted on existing node' },
                  { item: 'Loki + Promtail', cost: '€0', note: 'Self-hosted, ~200MB RAM' },
                  { item: 'Paperclip Service', cost: '€0', note: 'Runs alongside fleet, ~128MB' },
                  { item: 'Second Hetzner Node', cost: '~€8/mo', note: 'CX22: 2 vCPU, 4GB RAM (Phase 4)' },
                  { item: 'S3 Backups (Hetzner)', cost: '~€2/mo', note: 'Agent state snapshots' },
                ].map(c => (
                  <div key={c.item} style={{ background: 'rgba(255,255,255,.03)', border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{c.item}</div>
                    <div style={{ color: G, fontSize: '1.3rem', fontWeight: 800 }}>{c.cost}</div>
                    <div style={{ color: MUTED, fontSize: '.75rem', marginTop: 4 }}>{c.note}</div>
                  </div>
                ))}
              </div>
              <p style={{ color: MUTED, fontSize: '.82rem', marginTop: 16, textAlign: 'center' }}>
                Total additional cost through Phase 3: <strong style={{ color: G }}>€0/mo</strong> — all self-hosted on existing infrastructure.<br />
                Phase 4 adds ~€10/mo for multi-node expansion.
              </p>
            </div>

            {/* Tech stack */}
            <div style={glass({ marginTop: 24 })}>
              <h3 style={{ margin: '0 0 16px' }}>🛠️ Technology Stack</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                {[
                  { cat: 'Control Plane', items: ['TypeScript', 'Fastify / Hono', 'Docker SDK', 'WebSocket'] },
                  { cat: 'Monitoring', items: ['Prometheus', 'Grafana', 'cAdvisor', 'Node Exporter'] },
                  { cat: 'Logging', items: ['Loki', 'Promtail', 'Structured JSON logs'] },
                  { cat: 'Infrastructure', items: ['Docker Engine', 'Caddy', 'WireGuard', 'Hetzner Cloud'] },
                  { cat: 'Frontend', items: ['Next.js 14', 'React', 'Recharts', 'SSE / WebSocket'] },
                  { cat: 'CI/CD', items: ['GitHub Actions', 'Docker Build', 'Blue-Green Deploy'] },
                ].map(s => (
                  <div key={s.cat} style={{ background: 'rgba(255,255,255,.03)', border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14 }}>
                    <div style={{ fontWeight: 700, fontSize: '.85rem', marginBottom: 8, color: G }}>{s.cat}</div>
                    {s.items.map(item => (
                      <div key={item} style={{ color: MUTED, fontSize: '.78rem', padding: '2px 0' }}>• {item}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ─── Footer ──────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${BORDER}`, padding: '24px', textAlign: 'center', color: MUTED, fontSize: '.8rem' }}>
        Clawdet Fleet Management Plan — Paperclip Integration Proposal · March 2026
      </footer>
    </div>
  );
}
