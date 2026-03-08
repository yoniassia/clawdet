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
const BLUE = '#58a6ff';
const PURPLE = '#d2a8ff';
const ORANGE = '#f78166';
const YELLOW = '#e3b341';

/* ── style helpers ────────────────────────────────── */
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

const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono', Menlo, monospace", fontSize: '.82rem' };

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

const clawxComparison: { area: string; clawx: string; clawdet: string; adapt: string }[] = [
  { area: 'Nodes', clawx: '3 servers, 58+ agents', clawdet: '1 server, 8 agents', adapt: 'Add Hetzner workers via WireGuard' },
  { area: 'Load Balancing', clawx: 'getLeastLoadedNode() via HTTP', clawdet: 'None — single node', adapt: 'Port ClawX balancer, use container count' },
  { area: 'Inter-Node VPN', clawx: 'WireGuard (10.10.0.x)', clawdet: 'N/A', adapt: 'WireGuard mesh between Hetzner nodes' },
  { area: 'LLM Routing', clawx: 'LiteLLM proxy (:4000)', clawdet: 'Direct Claude API per agent', adapt: 'Deploy LiteLLM for model flexibility + caching' },
  { area: 'Reverse Proxy', clawx: 'Nginx + Certbot per worker', clawdet: 'Caddy (auto SSL)', adapt: 'Keep Caddy — simpler than Nginx+Certbot' },
  { area: 'Database', clawx: 'PostgreSQL + Redis', clawdet: 'File-based (.json + .md)', adapt: 'Add SQLite → PostgreSQL at scale' },
  { area: 'DNS', clawx: 'Cloudflare API automation', clawdet: 'Manual Cloudflare', adapt: 'Automate via Cloudflare API' },
  { area: 'Migration', clawx: '8-step container migration scripts', clawdet: 'No migration capability', adapt: 'Adapt migrate-container.sh for NanoClaw' },
  { area: 'Container Labels', clawx: 'moneyclaw.tenant + subdomain', clawdet: 'None', adapt: 'Add nanoclaw.tenant + nanoclaw.subdomain' },
  { area: 'Resource Limits', clawx: '1GB RAM, 0.5 CPU', clawdet: '256MB RAM, 0.5 CPU', adapt: 'Keep 256MB — NanoClaw is lighter' },
];

const migrationScripts = [
  {
    name: 'migrate-container.sh',
    origin: 'ClawX',
    steps: ['Inspect container', 'Export data volume', 'Tarball + SCP to target', 'Create on target node', 'Health check', 'Stop old container', 'Update Caddy config', 'Verify'],
    adaptNotes: 'Replace Nginx/Certbot with Caddy reload. Replace Cloudflare DNS call with our DNS helper. Change gateway bind from loopback→lan for WireGuard.',
  },
  {
    name: 'rebalance-cluster.sh',
    origin: 'ClawX',
    steps: ['Count containers per node', 'Calculate target = total / N', 'Identify over-capacity nodes', 'Migrate excess to under-capacity', 'Verify even distribution'],
    adaptNotes: 'Works as-is with node count configurable. Add --dry-run for safety. Batch size configurable.',
  },
  {
    name: 'parallel-migrate.sh',
    origin: 'ClawX (7-phase)',
    steps: ['Create all containers on target', 'Wait for cold starts (2.5 min)', 'Health check + restart failures', 'Stop old containers', 'Bulk DNS updates', 'Bulk Caddy reload', 'SSL verification'],
    adaptNotes: 'Best for bulk moves (e.g., adding a new node). Caddy simplifies phases 6-7 into single reload.',
  },
  {
    name: 'dns-reconcile.sh',
    origin: 'ClawX',
    steps: ['Query Cloudflare for all subdomains', 'Query container registry', 'Find stale DNS (no container)', 'Find missing DNS (no record)', 'Report / auto-fix'],
    adaptNotes: 'Critical for hygiene. Add to cron weekly.',
  },
];

const phases = [
  {
    phase: 'Phase 1',
    title: 'Observability + Foundation',
    weeks: 'Weeks 1–3',
    color: BLUE,
    items: [
      'Add Docker labels to all containers: nanoclaw.tenant, nanoclaw.subdomain, nanoclaw.port',
      'Deploy Prometheus + cAdvisor for per-container metrics',
      'Grafana dashboard: CPU, RAM, network per agent',
      'Centralised logs: Loki + Promtail → stream from Docker',
      'Health-check poller service: hit /health every 30s, alert on 3× miss',
      'Expose /api/fleet/status from Clawdet for dashboard integration',
    ],
    effort: '~40 hours',
    risk: 'Low — additive only, no production changes',
  },
  {
    phase: 'Phase 2',
    title: 'Control Plane + Database',
    weeks: 'Weeks 4–7',
    color: G,
    items: [
      'Replace file-based agent registry with SQLite (→ PostgreSQL later)',
      'Build provisioner-v2: Fastify service with Docker SDK (dockerode)',
      'Agent lifecycle API: create / start / stop / restart / destroy',
      'Automate Cloudflare DNS via API (adapt ClawX pattern)',
      'Deploy LiteLLM proxy for unified LLM routing + model flexibility',
      'Rolling-update command: rebuild image → blue-green restart per agent',
      'Integrate with Clawdet dashboard: real-time agent status via WebSocket',
    ],
    effort: '~80 hours',
    risk: 'Medium — replaces provisioner; needs careful testing',
  },
  {
    phase: 'Phase 3',
    title: 'Multi-Node (ClawX Pattern)',
    weeks: 'Weeks 8–12',
    color: PURPLE,
    items: [
      'Provision 2nd Hetzner node (CX22: 2 vCPU, 4GB, ~€8/mo)',
      'Set up WireGuard VPN between nodes (10.10.0.x subnet)',
      'Worker health API: expose /api/health with container count on each node',
      'Implement getLeastLoadedNode() in provisioner (ClawX pattern)',
      'Adapt migrate-container.sh for NanoClaw (Caddy instead of Nginx)',
      'Adapt rebalance-cluster.sh for automated fleet rebalancing',
      'Cross-node Caddy config: route subdomains to correct node via WireGuard',
      'Test: migrate agent from main → worker with zero downtime',
    ],
    effort: '~100 hours',
    risk: 'High — networking + state migration; needs staging environment',
  },
  {
    phase: 'Phase 4',
    title: 'Auto-Scale + Resilience',
    weeks: 'Weeks 13–18',
    color: ORANGE,
    items: [
      'Auto-scale trigger: when node utilisation > 80%, provision new Hetzner node via API',
      'Adapt parallel-migrate.sh for bulk moves to new nodes',
      'Agent state snapshots: tarball volumes → Hetzner S3 daily',
      'Disaster recovery: restore agent from snapshot on any node',
      'DNS reconciliation cron (adapt dns-reconcile.sh)',
      'Terraform/Pulumi IaC for node provisioning',
      'Fleet dashboard v2: node map, migration status, capacity planning',
    ],
    effort: '~80 hours',
    risk: 'Medium — auto-provisioning needs guardrails (max nodes, budget caps)',
  },
];

const capacityModel = [
  { nodes: 1, agents: 15, ram: '4 GB', cost: '€4.50/mo', note: 'Current (CX22)' },
  { nodes: 2, agents: 30, ram: '8 GB', cost: '€12.50/mo', note: 'Phase 3 target' },
  { nodes: 3, agents: 50, ram: '12 GB', cost: '€20.50/mo', note: 'ClawX-equivalent scale' },
  { nodes: 5, agents: 90, ram: '20 GB', cost: '€36.50/mo', note: 'Full port range (18810-18899)' },
  { nodes: 10, agents: 200, ram: '40 GB', cost: '€73/mo', note: 'Enterprise scale' },
];

/* ── tab type ─────────────────────────────────────── */
type Tab = 'current' | 'clawx' | 'scripts' | 'roadmap' | 'capacity' | 'paperclip';

export default function FleetMgmtPage() {
  const [tab, setTab] = useState<Tab>('current');

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
      <header style={{ textAlign: 'center', padding: '56px 24px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: `radial-gradient(circle, rgba(46,230,138,.12) 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <span style={badge()}>FLEET MANAGEMENT PLAN</span>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, margin: '20px 0 12px', lineHeight: 1.15 }}>
          From <span style={{ color: ORANGE }}>1 Node</span> to{' '}
          <span style={{ color: G }}>Multi-Node Fleet</span>
        </h1>
        <p style={{ color: MUTED, maxWidth: 660, margin: '0 auto', fontSize: '1rem', lineHeight: 1.6 }}>
          Scaling NanoClaw using proven patterns from ClawX — a production system running <strong style={{ color: TEXT }}>58+ agents across 3 servers</strong>. WireGuard VPN, load-balanced provisioning, zero-downtime migration scripts, and LiteLLM routing — adapted for Clawdet.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
          <span style={{ ...badge(BLUE), fontSize: '.65rem' }}>BASED ON CLAWX PRODUCTION</span>
          <span style={{ ...badge(PURPLE), fontSize: '.65rem' }}>58+ AGENTS PROVEN</span>
          <span style={{ ...badge(ORANGE), fontSize: '.65rem' }}>3-NODE ARCHITECTURE</span>
        </div>
      </header>

      {/* ─── Tab Bar ─────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 24px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {([
          ['current', '📡 Current State'],
          ['clawx', '🔬 ClawX vs Clawdet'],
          ['scripts', '📜 Migration Scripts'],
          ['roadmap', '🗺️ Roadmap'],
          ['capacity', '📊 Capacity & Cost'],
          ['paperclip', '🤖 Paperclip'],
        ] as [Tab, string][]).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 18px',
            borderRadius: 10,
            border: tab === t ? `1px solid ${G}` : `1px solid ${BORDER}`,
            background: tab === t ? 'rgba(46,230,138,.12)' : 'transparent',
            color: tab === t ? G : MUTED,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '.85rem',
            transition: 'all .2s',
          }}>{label}</button>
        ))}
      </div>

      {/* ─── Content ─────────────────────────────── */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px' }}>

        {/* ═══════════════ CURRENT STATE ═══════════════ */}
        {tab === 'current' && (
          <div>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
              {[
                ['8', 'Running Agents', G],
                ['256 MB', 'RAM / Agent', BLUE],
                ['0.5', 'CPU / Agent', PURPLE],
                ['18810–18899', 'Port Range', YELLOW],
                ['1', 'Hetzner Node', ORANGE],
                ['90', 'Max Slots', MUTED],
              ].map(([val, label, c]) => (
                <div key={label} style={glass({ textAlign: 'center', padding: 18 })}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: c as string }}>{val}</div>
                  <div style={{ color: MUTED, fontSize: '.75rem', marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Current architecture diagram */}
            <div style={glass({ marginBottom: 24 })}>
              <h3 style={{ margin: '0 0 20px', fontSize: '1.05rem' }}>🏗️ Current Architecture — Single Node</h3>
              <div style={{ ...mono, background: '#0d1117', borderRadius: 10, padding: 20, overflowX: 'auto', lineHeight: 1.8 }}>
                <div style={{ color: MUTED }}>{'// Hetzner CX22 — 188.34.197.212'}</div>
                <div style={{ color: YELLOW }}>{'Internet → Caddy (auto-SSL) → *.clawdet.com'}</div>
                <div style={{ color: MUTED }}>{'         │'}</div>
                <div style={{ color: G }}>{'         ├── :3002  Clawdet (Next.js + PM2)'}</div>
                <div style={{ color: BLUE }}>{'         ├── :18810 nanoclaw-yoni    [256MB, 0.5CPU]'}</div>
                <div style={{ color: BLUE }}>{'         ├── :18811 nanoclaw-demo    [256MB, 0.5CPU]'}</div>
                <div style={{ color: BLUE }}>{'         ├── :18812 nanoclaw-trial-1 [256MB, 0.5CPU]'}</div>
                <div style={{ color: BLUE }}>{'         ├── :18813 nanoclaw-trial-2 [256MB, 0.5CPU]'}</div>
                <div style={{ color: BLUE }}>{'         ├── :18814 nanoclaw-trial-3 [256MB, 0.5CPU]'}</div>
                <div style={{ color: BLUE }}>{'         ├── :18815 nanoclaw-trial-4 [256MB, 0.5CPU]'}</div>
                <div style={{ color: BLUE }}>{'         ├── :18816 nanoclaw-trial-5 [256MB, 0.5CPU]'}</div>
                <div style={{ color: MUTED }}>{'         └── :18817 nanoclaw-trial-6 [idle]'}</div>
                <div style={{ color: MUTED, marginTop: 12 }}>{'// Provisioner: lib/provisioner-docker.ts'}</div>
                <div style={{ color: MUTED }}>{'// 4 steps: validate → docker run → DNS → health'}</div>
                <div style={{ color: MUTED }}>{'// Agent data: /root/nanoclaw-fleet/agents/{username}/'}</div>
              </div>
            </div>

            {/* Fleet table */}
            <div style={glass({ overflowX: 'auto' })}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem' }}>🐳 Fleet Status</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.83rem' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                    {['Container', 'Port', 'Status', 'Memory', 'CPU', 'Uptime'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: MUTED, fontWeight: 600, fontSize: '.72rem', letterSpacing: '.04em', textTransform: 'uppercase' as const }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentFleet.map(a => (
                    <tr key={a.name} style={{ borderBottom: `1px solid ${BORDER}22` }}>
                      <td style={{ padding: '10px 12px', ...mono, fontWeight: 600 }}>{a.name}</td>
                      <td style={{ padding: '10px 12px', ...mono, color: BLUE }}>{a.port}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: a.status === 'running' ? G : '#f0883e', boxShadow: a.status === 'running' ? `0 0 8px ${G}44` : 'none' }} />
                          {a.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', ...mono }}>{a.mem}</td>
                      <td style={{ padding: '10px 12px', ...mono }}>{a.cpu}</td>
                      <td style={{ padding: '10px 12px', color: MUTED }}>{a.uptime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottlenecks */}
            <div style={glass({ marginTop: 24 })}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem' }}>⚠️ Current Limitations</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                {[
                  { icon: '🖥️', title: 'Single Point of Failure', desc: 'One Hetzner node — if it goes down, all 8 agents go offline.' },
                  { icon: '📊', title: 'No Observability', desc: 'Checking agent health means SSH + docker stats. No dashboards, no alerts.' },
                  { icon: '🔄', title: 'No Migration Path', desc: 'Cannot move agents between servers. No data export/import tooling.' },
                  { icon: '📈', title: 'Scaling Ceiling', desc: '~15 agents max on 4GB RAM. Port range supports 90 but RAM caps at ~15.' },
                  { icon: '🤖', title: 'Single LLM Provider', desc: 'Every agent calls Claude directly. No caching, no fallback, no model routing.' },
                  { icon: '📝', title: 'File-Based Registry', desc: '.json + .md files on disk. No query, no audit trail, no concurrent safety.' },
                ].map(b => (
                  <div key={b.title} style={{ background: 'rgba(247,129,102,.05)', border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16 }}>
                    <div style={{ fontSize: '1.1rem', marginBottom: 6 }}>{b.icon} <strong>{b.title}</strong></div>
                    <div style={{ color: MUTED, fontSize: '.82rem', lineHeight: 1.5 }}>{b.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ CLAWX COMPARISON ═══════════════ */}
        {tab === 'clawx' && (
          <div>
            {/* ClawX architecture */}
            <div style={glass({ marginBottom: 24 })}>
              <h3 style={{ margin: '0 0 6px', fontSize: '1.05rem' }}>🔬 ClawX (MoneyClaw) — Production Reference</h3>
              <p style={{ color: MUTED, margin: '0 0 20px', fontSize: '.88rem' }}>
                Running <strong style={{ color: TEXT }}>58+ tenant agents across 3 servers</strong> in production. This is the architecture we&apos;re adapting.
              </p>
              <div style={{ ...mono, background: '#0d1117', borderRadius: 10, padding: 20, overflowX: 'auto', lineHeight: 1.8 }}>
                <div style={{ color: YELLOW }}>{'Nginx (LB) → *.moneyclaw.com'}</div>
                <div style={{ color: MUTED }}>{'│'}</div>
                <div style={{ color: G }}>{'├── ClawX (Next.js :3000)'}</div>
                <div style={{ color: PURPLE }}>{'├── Provisioner (Fastify :4002) ← PostgreSQL + Redis + Docker API'}</div>
                <div style={{ color: BLUE }}>{'├── LiteLLM Proxy (:4000) → Grok 4 / Claude / GPT'}</div>
                <div style={{ color: MUTED }}>{'│'}</div>
                <div style={{ color: ORANGE }}>{'├── Main Server (76.13.x.x)      ~22 tenants  ──┐'}</div>
                <div style={{ color: ORANGE }}>{'├── Worker 1  (10.10.0.2 via WG)  ~18 tenants  ──┤ WireGuard VPN'}</div>
                <div style={{ color: ORANGE }}>{'└── Worker 2  (10.10.0.3 via WG)  ~18 tenants  ──┘ (10.10.0.x)'}</div>
                <div style={{ color: MUTED, marginTop: 12 }}>{'// Load balance: getLeastLoadedNode() → HTTP /api/health per worker'}</div>
                <div style={{ color: MUTED }}>{'// Migration: 8-step container transfer (inspect → tar → SCP → DNS)'}</div>
                <div style={{ color: MUTED }}>{'// Labels: moneyclaw.tenant + moneyclaw.subdomain per container'}</div>
              </div>
            </div>

            {/* Side-by-side comparison */}
            <div style={glass({ overflowX: 'auto' })}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem' }}>📊 Component-by-Component: ClawX → Clawdet Adaptation</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${G}33` }}>
                    <th style={{ textAlign: 'left', padding: '10px 12px', color: MUTED, fontWeight: 700, fontSize: '.72rem', letterSpacing: '.04em', textTransform: 'uppercase' as const, width: '15%' }}>Area</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px', color: BLUE, fontWeight: 700, fontSize: '.72rem', letterSpacing: '.04em', textTransform: 'uppercase' as const, width: '25%' }}>ClawX (Production)</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px', color: ORANGE, fontWeight: 700, fontSize: '.72rem', letterSpacing: '.04em', textTransform: 'uppercase' as const, width: '25%' }}>Clawdet (Current)</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px', color: G, fontWeight: 700, fontSize: '.72rem', letterSpacing: '.04em', textTransform: 'uppercase' as const, width: '35%' }}>Adaptation Plan</th>
                  </tr>
                </thead>
                <tbody>
                  {clawxComparison.map((r, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${BORDER}33` }}>
                      <td style={{ padding: '12px', fontWeight: 700, fontSize: '.83rem' }}>{r.area}</td>
                      <td style={{ padding: '12px', color: BLUE, ...mono }}>{r.clawx}</td>
                      <td style={{ padding: '12px', color: ORANGE, ...mono }}>{r.clawdet}</td>
                      <td style={{ padding: '12px', color: G, fontSize: '.82rem' }}>{r.adapt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Target architecture */}
            <div style={glass({ marginTop: 24 })}>
              <h3 style={{ margin: '0 0 20px', fontSize: '1.05rem' }}>🎯 Target Architecture — Clawdet Multi-Node</h3>
              <div style={{ ...mono, background: '#0d1117', borderRadius: 10, padding: 20, overflowX: 'auto', lineHeight: 1.8 }}>
                <div style={{ color: YELLOW }}>{'Caddy (auto-SSL) → *.clawdet.com'}</div>
                <div style={{ color: MUTED }}>{'│'}</div>
                <div style={{ color: G }}>{'├── Clawdet (Next.js :3002)         ← Dashboard + Fleet UI'}</div>
                <div style={{ color: PURPLE }}>{'├── Provisioner v2 (Fastify :4002)  ← SQLite + Docker SDK'}</div>
                <div style={{ color: BLUE }}>{'├── LiteLLM Proxy (:4000)           ← Claude / Grok / GPT routing'}</div>
                <div style={{ color: '#79c0ff' }}>{'├── Prometheus (:9090) + Grafana (:3003) + Loki (:3100)'}</div>
                <div style={{ color: MUTED }}>{'│'}</div>
                <div style={{ color: G }}>{'├── Main Node (188.34.197.212)      ~15 agents  ──┐'}</div>
                <div style={{ color: G }}>{'├── Worker 1  (10.10.0.2 via WG)    ~15 agents  ──┤ WireGuard VPN'}</div>
                <div style={{ color: G }}>{'└── Worker 2  (10.10.0.3 via WG)    ~15 agents  ──┘ (10.10.0.x)'}</div>
                <div style={{ color: MUTED, marginTop: 12 }}>{'// getLeastLoadedNode() → HTTP /api/health per worker'}</div>
                <div style={{ color: MUTED }}>{'// migrate-container.sh: inspect → tar → SCP → Caddy → verify'}</div>
                <div style={{ color: MUTED }}>{'// rebalance-cluster.sh: auto-distribute on capacity threshold'}</div>
                <div style={{ color: MUTED }}>{'// Labels: nanoclaw.tenant + nanoclaw.subdomain per container'}</div>
              </div>
            </div>

            {/* Key decisions */}
            <div style={glass({ marginTop: 24 })}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem' }}>🧠 Key Adaptation Decisions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                {[
                  { icon: '✅', title: 'Keep Caddy over Nginx', desc: 'ClawX uses Nginx + Certbot (3 steps per SSL cert). Caddy auto-provisions SSL — eliminates entire phases from migration scripts. Huge simplification.', color: G },
                  { icon: '✅', title: 'Adopt WireGuard VPN', desc: 'ClawX\'s WireGuard mesh is proven at 3 nodes. Private 10.10.0.x subnet for inter-node Docker communication. Simple setup, kernel-level speed.', color: G },
                  { icon: '✅', title: 'Adopt getLeastLoadedNode()', desc: 'Simple but effective: query /api/health on each worker, pick lowest container count. No complex scheduling needed at our scale.', color: G },
                  { icon: '✅', title: 'Adopt LiteLLM Proxy', desc: 'Unified LLM routing lets agents use Claude, GPT, or Grok without config changes. Adds model fallback + request caching. Single API key management point.', color: G },
                  { icon: '🔄', title: 'SQLite before PostgreSQL', desc: 'ClawX uses PostgreSQL + Redis. At 8-50 agents, SQLite is simpler with zero ops overhead. Switch to PG at 100+ agents if needed.', color: YELLOW },
                  { icon: '🔄', title: 'Adapt Migration Scripts', desc: 'ClawX scripts are battle-tested but Nginx-specific. Main work: replace Nginx/Certbot calls with Caddy API, replace Cloudflare calls with our DNS helper.', color: YELLOW },
                ].map(d => (
                  <div key={d.title} style={{ background: 'rgba(255,255,255,.03)', border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16 }}>
                    <div style={{ fontSize: '1rem', marginBottom: 6, color: d.color }}>{d.icon} <strong style={{ color: TEXT }}>{d.title}</strong></div>
                    <div style={{ color: MUTED, fontSize: '.8rem', lineHeight: 1.55 }}>{d.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ MIGRATION SCRIPTS ═══════════════ */}
        {tab === 'scripts' && (
          <div>
            <p style={{ color: MUTED, fontSize: '.9rem', marginBottom: 24, lineHeight: 1.6 }}>
              ClawX has <strong style={{ color: TEXT }}>4 battle-tested migration scripts</strong> for moving containers between nodes. These are the exact patterns we&apos;ll adapt for NanoClaw — proven in production with 58+ agents.
            </p>

            {migrationScripts.map((s, si) => (
              <div key={si} style={glass({ marginBottom: 20 })}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                  <span style={{ ...mono, fontWeight: 700, fontSize: '1rem', color: G }}>{s.name}</span>
                  <span style={badge(BLUE)}>{s.origin}</span>
                </div>

                {/* Step flow */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 16 }}>
                  {s.steps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{
                        background: 'rgba(46,230,138,.08)',
                        border: `1px solid ${BORDER}`,
                        borderRadius: 8,
                        padding: '8px 14px',
                        fontSize: '.78rem',
                        whiteSpace: 'nowrap' as const,
                      }}>
                        <span style={{ color: G, fontWeight: 700, marginRight: 6 }}>{i + 1}</span>
                        <span style={{ color: TEXT }}>{step}</span>
                      </div>
                      {i < s.steps.length - 1 && <span style={{ color: G, fontWeight: 700, fontSize: '.9rem' }}>→</span>}
                    </div>
                  ))}
                </div>

                {/* Adaptation notes */}
                <div style={{ background: 'rgba(88,166,255,.06)', border: `1px solid ${BLUE}33`, borderRadius: 8, padding: '12px 16px' }}>
                  <div style={{ fontSize: '.72rem', fontWeight: 700, color: BLUE, textTransform: 'uppercase' as const, letterSpacing: '.04em', marginBottom: 6 }}>Adaptation Notes</div>
                  <div style={{ color: MUTED, fontSize: '.82rem', lineHeight: 1.5 }}>{s.adaptNotes}</div>
                </div>
              </div>
            ))}

            {/* Key difference callout */}
            <div style={glass({ marginTop: 8, borderColor: `${G}44` })}>
              <h3 style={{ margin: '0 0 12px', fontSize: '1.05rem', color: G }}>💡 Caddy Advantage: Script Simplification</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                <div style={{ padding: 16, background: 'rgba(247,129,102,.05)', borderRadius: 10, border: `1px solid ${BORDER}` }}>
                  <div style={{ fontWeight: 700, color: ORANGE, marginBottom: 8 }}>ClawX (Nginx + Certbot)</div>
                  <div style={{ ...mono, color: MUTED, lineHeight: 1.8 }}>
                    <div>1. Generate nginx config file</div>
                    <div>2. Write to /etc/nginx/sites-available/</div>
                    <div>3. Symlink to sites-enabled/</div>
                    <div>4. Test nginx config (nginx -t)</div>
                    <div>5. Reload nginx</div>
                    <div>6. Run certbot for SSL cert</div>
                    <div>7. Reload nginx again</div>
                    <div style={{ color: ORANGE, fontWeight: 700, marginTop: 8 }}>= 7 steps per migration, per domain</div>
                  </div>
                </div>
                <div style={{ padding: 16, background: 'rgba(46,230,138,.05)', borderRadius: 10, border: `1px solid ${BORDER}` }}>
                  <div style={{ fontWeight: 700, color: G, marginBottom: 8 }}>Clawdet (Caddy)</div>
                  <div style={{ ...mono, color: MUTED, lineHeight: 1.8 }}>
                    <div>1. Update Caddyfile with new upstream</div>
                    <div>2. Reload Caddy</div>
                    <div>3. <span style={{ color: G }}>SSL auto-provisioned ✓</span></div>
                    <div>&nbsp;</div>
                    <div>&nbsp;</div>
                    <div>&nbsp;</div>
                    <div>&nbsp;</div>
                    <div style={{ color: G, fontWeight: 700, marginTop: 8 }}>= 2 steps. Auto-SSL. Done.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ ROADMAP ═══════════════ */}
        {tab === 'roadmap' && (
          <div>
            {/* Timeline */}
            <div style={{ position: 'relative', paddingLeft: 36 }}>
              <div style={{ position: 'absolute', left: 14, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${BLUE}, ${G}, ${PURPLE}, ${ORANGE})` }} />

              {phases.map((p, i) => (
                <div key={i} style={{ marginBottom: 28, position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: -29,
                    top: 6,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: p.color,
                    border: `3px solid ${BG}`,
                    boxShadow: `0 0 12px ${p.color}44`,
                  }} />

                  <div style={glass()}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                      <span style={badge(p.color)}>{p.phase}</span>
                      <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{p.title}</h3>
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ color: MUTED, fontSize: '.78rem', background: 'rgba(255,255,255,.04)', padding: '3px 10px', borderRadius: 12 }}>{p.weeks}</span>
                        <span style={{ color: MUTED, fontSize: '.78rem', background: 'rgba(255,255,255,.04)', padding: '3px 10px', borderRadius: 12 }}>{p.effort}</span>
                      </div>
                    </div>

                    <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 2, fontSize: '.87rem' }}>
                      {p.items.map(item => (
                        <li key={item} style={{ color: MUTED }}>
                          <span style={{ color: TEXT }}>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <div style={{ marginTop: 14, padding: '8px 14px', background: `rgba(255,255,255,.03)`, borderRadius: 8, display: 'inline-block' }}>
                      <span style={{ fontSize: '.72rem', fontWeight: 700, color: p.color, textTransform: 'uppercase' as const, letterSpacing: '.03em' }}>Risk: </span>
                      <span style={{ fontSize: '.82rem', color: MUTED }}>{p.risk}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Milestones */}
            <div style={glass({ marginTop: 8 })}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem' }}>🏁 Key Milestones</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                {[
                  { week: 'Week 3', milestone: 'Grafana + Loki live', icon: '📊', color: BLUE },
                  { week: 'Week 7', milestone: 'Provisioner v2 + LiteLLM deployed', icon: '🚀', color: G },
                  { week: 'Week 10', milestone: 'First agent migrated between nodes', icon: '🔄', color: PURPLE },
                  { week: 'Week 12', milestone: '3-node fleet operational', icon: '🌐', color: PURPLE },
                  { week: 'Week 15', milestone: 'Auto-scale trigger working', icon: '📈', color: ORANGE },
                  { week: 'Week 18', milestone: 'Full fleet management platform', icon: '🎯', color: ORANGE },
                ].map(m => (
                  <div key={m.week} style={{ background: 'rgba(255,255,255,.03)', border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14, textAlign: 'center' }}>
                    <div style={{ fontSize: '1.3rem', marginBottom: 6 }}>{m.icon}</div>
                    <div style={{ fontWeight: 700, color: m.color, fontSize: '.82rem' }}>{m.week}</div>
                    <div style={{ color: TEXT, fontSize: '.82rem', marginTop: 4 }}>{m.milestone}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total effort */}
            <div style={glass({ marginTop: 20, textAlign: 'center', borderColor: `${G}33` })}>
              <div style={{ fontSize: '.75rem', color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '.05em', marginBottom: 8 }}>Estimated Total Effort</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: G }}>~300 hours</div>
              <div style={{ color: MUTED, fontSize: '.85rem', marginTop: 6 }}>
                18 weeks · 4 phases · Based on proven ClawX patterns
              </div>
              <div style={{ color: MUTED, fontSize: '.78rem', marginTop: 12, maxWidth: 500, margin: '12px auto 0' }}>
                Phase 1–2 deliver immediate value (observability + control plane). Phase 3 unlocks multi-node. Phase 4 is automation — can be deferred.
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ CAPACITY & COST ═══════════════ */}
        {tab === 'capacity' && (
          <div>
            {/* Capacity model */}
            <div style={glass({ overflowX: 'auto', marginBottom: 24 })}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem' }}>📊 Capacity Planning Model</h3>
              <p style={{ color: MUTED, fontSize: '.85rem', margin: '0 0 16px' }}>
                Based on 256MB RAM per agent, Hetzner CX22 nodes (4GB RAM, 2 vCPU, ~€4.50/mo each).
                ClawX runs ~20 agents per node at 1GB each — NanoClaw agents are 4× lighter.
              </p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${G}33` }}>
                    {['Nodes', 'Max Agents', 'Total RAM', 'Infra Cost', 'Note'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: MUTED, fontWeight: 700, fontSize: '.72rem', letterSpacing: '.04em', textTransform: 'uppercase' as const }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {capacityModel.map((r, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${BORDER}33`, background: i === 0 ? 'rgba(247,129,102,.04)' : i === 2 ? 'rgba(46,230,138,.04)' : 'transparent' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: i === 0 ? ORANGE : G }}>{r.nodes}</td>
                      <td style={{ padding: '12px 14px', ...mono, fontWeight: 700 }}>{r.agents}</td>
                      <td style={{ padding: '12px 14px', ...mono }}>{r.ram}</td>
                      <td style={{ padding: '12px 14px', ...mono, color: G }}>{r.cost}</td>
                      <td style={{ padding: '12px 14px', color: MUTED }}>
                        {r.note}
                        {i === 0 && <span style={{ ...badge(ORANGE), marginLeft: 8, fontSize: '.6rem' }}>NOW</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cost breakdown */}
            <div style={glass({ marginBottom: 24 })}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem' }}>💰 Infrastructure Cost Breakdown</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                {[
                  { item: 'Hetzner CX22 (main)', cost: '€4.50/mo', phase: 'Current', color: ORANGE },
                  { item: 'Prometheus + Grafana + Loki', cost: '€0', phase: 'Phase 1', color: BLUE, note: 'Self-hosted, ~512MB RAM' },
                  { item: 'LiteLLM Proxy', cost: '€0', phase: 'Phase 2', color: G, note: 'Self-hosted, ~128MB RAM' },
                  { item: 'Provisioner v2', cost: '€0', phase: 'Phase 2', color: G, note: 'Self-hosted, ~64MB RAM' },
                  { item: 'Hetzner CX22 (worker 1)', cost: '€4.50/mo', phase: 'Phase 3', color: PURPLE },
                  { item: 'Hetzner CX22 (worker 2)', cost: '€4.50/mo', phase: 'Phase 3', color: PURPLE },
                  { item: 'Hetzner S3 (backups)', cost: '~€2/mo', phase: 'Phase 4', color: ORANGE, note: 'Agent state snapshots' },
                  { item: 'WireGuard VPN', cost: '€0', phase: 'Phase 3', color: PURPLE, note: 'Built into Linux kernel' },
                ].map(c => (
                  <div key={c.item} style={{ background: 'rgba(255,255,255,.03)', border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4, fontSize: '.88rem' }}>{c.item}</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: c.color }}>{c.cost}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                      <span style={{ ...badge(c.color), fontSize: '.6rem' }}>{c.phase}</span>
                    </div>
                    {c.note && <div style={{ color: MUTED, fontSize: '.72rem', marginTop: 6 }}>{c.note}</div>}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 20, padding: 16, background: 'rgba(46,230,138,.05)', borderRadius: 10, border: `1px solid ${G}22`, textAlign: 'center' }}>
                <div style={{ fontSize: '.75rem', color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '.05em', marginBottom: 6 }}>Total at Full 3-Node Scale</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: G }}>~€15.50/mo</div>
                <div style={{ color: MUTED, fontSize: '.82rem', marginTop: 4 }}>3 nodes · 50 agents · Full observability · Multi-node migration</div>
                <div style={{ color: G, fontSize: '.82rem', marginTop: 8, fontWeight: 600 }}>~€0.31 per agent per month</div>
              </div>
            </div>

            {/* Cost per agent chart */}
            <div style={glass({ marginBottom: 24 })}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem' }}>📉 Cost Per Agent at Scale</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { agents: '8 agents (now)', cost: 0.56, max: 0.75 },
                  { agents: '15 agents', cost: 0.30, max: 0.75 },
                  { agents: '30 agents', cost: 0.42, max: 0.75 },
                  { agents: '50 agents', cost: 0.31, max: 0.75 },
                  { agents: '100 agents', cost: 0.24, max: 0.75 },
                  { agents: '200 agents', cost: 0.37, max: 0.75 },
                ].map(r => (
                  <div key={r.agents} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 130, fontSize: '.82rem', color: MUTED, textAlign: 'right', flexShrink: 0 }}>{r.agents}</div>
                    <div style={{ flex: 1, height: 28, background: 'rgba(255,255,255,.04)', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                      <div style={{
                        height: '100%',
                        width: `${(r.cost / r.max) * 100}%`,
                        background: `linear-gradient(90deg, ${G}, ${BLUE})`,
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: 10,
                        fontSize: '.75rem',
                        fontWeight: 700,
                        color: BG,
                        minWidth: 60,
                      }}>
                        €{r.cost.toFixed(2)}/agent
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ color: MUTED, fontSize: '.75rem', marginTop: 12, textAlign: 'center' }}>
                Infrastructure cost only. LLM API costs (Claude/GPT) are per-usage and not included.
              </div>
            </div>

            {/* Tech stack */}
            <div style={glass()}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem' }}>🛠️ Full Technology Stack</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
                {[
                  { cat: 'Control Plane', items: ['Fastify (provisioner)', 'Docker SDK (dockerode)', 'SQLite → PostgreSQL', 'WebSocket (real-time)'], color: G },
                  { cat: 'Networking', items: ['WireGuard VPN', 'Caddy (auto-SSL)', 'Cloudflare DNS API', 'getLeastLoadedNode()'], color: BLUE },
                  { cat: 'LLM Routing', items: ['LiteLLM Proxy', 'Claude / GPT / Grok', 'Request caching', 'Model fallback'], color: PURPLE },
                  { cat: 'Monitoring', items: ['Prometheus', 'Grafana', 'cAdvisor', 'Node Exporter'], color: YELLOW },
                  { cat: 'Logging', items: ['Loki', 'Promtail', 'Docker log driver', 'Structured JSON'], color: '#79c0ff' },
                  { cat: 'Migration', items: ['migrate-container.sh', 'rebalance-cluster.sh', 'parallel-migrate.sh', 'dns-reconcile.sh'], color: ORANGE },
                ].map(s => (
                  <div key={s.cat} style={{ background: 'rgba(255,255,255,.03)', border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14 }}>
                    <div style={{ fontWeight: 700, fontSize: '.82rem', marginBottom: 8, color: s.color }}>{s.cat}</div>
                    {s.items.map(item => (
                      <div key={item} style={{ color: MUTED, fontSize: '.76rem', padding: '2px 0' }}>• {item}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* ═══════════════ PAPERCLIP ═══════════════ */}
        {tab === 'paperclip' && (
          <div>
            {/* Header / What is Paperclip */}
            <div style={glass({ marginBottom: 24, borderColor: `${G}33` })}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '2.2rem' }}>📎</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.3rem' }}>
                    Paperclip
                    <a href="https://github.com/paperclipai/paperclip" target="_blank" rel="noopener noreferrer" style={{ marginLeft: 12, textDecoration: 'none' }}>
                      <span style={{ ...badge(YELLOW), fontSize: '.65rem', verticalAlign: 'middle' }}>⭐ 10.9K</span>
                    </a>
                    <span style={{ ...badge(G), fontSize: '.6rem', marginLeft: 8, verticalAlign: 'middle' }}>MIT</span>
                    <span style={{ ...badge(PURPLE), fontSize: '.6rem', marginLeft: 8, verticalAlign: 'middle' }}>OPENCLAW BRANCH</span>
                  </h3>
                  <p style={{ margin: '6px 0 0', color: MUTED, fontSize: '.88rem' }}>
                    Open-source orchestration platform for <strong style={{ color: TEXT }}>&ldquo;zero-human companies&rdquo;</strong>
                  </p>
                </div>
              </div>
              <div style={{ background: `linear-gradient(135deg, rgba(46,230,138,.08), rgba(210,168,255,.06))`, border: `1px solid ${G}33`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, textAlign: 'center', lineHeight: 1.7 }}>
                  <span style={{ color: MUTED }}>If</span>{' '}
                  <span style={{ color: BLUE }}>OpenClaw is an employee</span>
                  <span style={{ color: MUTED }}>,</span>{' '}
                  <span style={{ color: G }}>Paperclip is the company.</span>
                </div>
              </div>
              <p style={{ color: MUTED, fontSize: '.88rem', lineHeight: 1.7, margin: 0 }}>
                Paperclip is <strong style={{ color: TEXT }}>not a container orchestrator</strong> — it&apos;s a <strong style={{ color: G }}>control plane for AI agent teams</strong>. It orchestrates teams of AI agents toward business goals with org charts, budgets, governance, goal alignment, heartbeat-based task scheduling, cost control, ticket systems, and multi-company isolation. Stack: Node.js + React UI + PostgreSQL. Port 3100. Docker compose available.
              </p>
              <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                {['OpenClaw', 'Claude Code', 'Codex', 'Cursor', 'Bash', 'HTTP'].map(a => (
                  <span key={a} style={{ padding: '4px 12px', borderRadius: 20, fontSize: '.72rem', fontWeight: 600, color: TEXT, background: 'rgba(255,255,255,.06)', border: `1px solid ${BORDER}` }}>
                    {a}
                  </span>
                ))}
                <span style={{ color: MUTED, fontSize: '.72rem', alignSelf: 'center' }}>← supported agent runtimes</span>
              </div>
            </div>

            {/* Architecture Diagram */}
            <div style={glass({ marginBottom: 24 })}>
              <h3 style={{ margin: '0 0 20px', fontSize: '1.05rem' }}>🏗️ Architecture — Paperclip as Orchestration Layer</h3>
              <div style={{ ...mono, background: '#0d1117', borderRadius: 10, padding: 24, overflowX: 'auto', lineHeight: 2 }}>
                <div style={{ color: YELLOW, fontWeight: 700 }}>{'                    👤 User / Business Owner'}</div>
                <div style={{ color: MUTED }}>{'                           │'}</div>
                <div style={{ color: MUTED }}>{'                    Goals, Budgets, Org Chart'}</div>
                <div style={{ color: MUTED }}>{'                           │'}</div>
                <div style={{ color: MUTED }}>{'              ┌────────────▼────────────┐'}</div>
                <div style={{ color: G, fontWeight: 700 }}>{'              │   📎 PAPERCLIP (:3100)   │'}</div>
                <div style={{ color: G }}>{'              │  ┌─────────────────────┐ │'}</div>
                <div style={{ color: G }}>{'              │  │  Company Brain      │ │'}</div>
                <div style={{ color: G }}>{'              │  │  • Org Chart        │ │'}</div>
                <div style={{ color: G }}>{'              │  │  • Goal Alignment   │ │'}</div>
                <div style={{ color: G }}>{'              │  │  • Budget Control   │ │'}</div>
                <div style={{ color: G }}>{'              │  │  • Ticket System    │ │'}</div>
                <div style={{ color: G }}>{'              │  │  • Heartbeat Sched  │ │'}</div>
                <div style={{ color: G }}>{'              │  │  • Governance       │ │'}</div>
                <div style={{ color: G }}>{'              │  └─────────────────────┘ │'}</div>
                <div style={{ color: G }}>{'              │       React UI + PG      │'}</div>
                <div style={{ color: MUTED }}>{'              └──┬─────────┬─────────┬──┘'}</div>
                <div style={{ color: MUTED }}>{'                 │         │         │'}</div>
                <div style={{ color: MUTED }}>{'          openclawgateway  │    HTTP adapters'}</div>
                <div style={{ color: MUTED }}>{'                 │         │         │'}</div>
                <div style={{ color: BLUE }}>{'           ┌─────▼──┐ ┌────▼───┐ ┌───▼────┐'}</div>
                <div style={{ color: BLUE }}>{'           │NanoClaw│ │NanoClaw│ │NanoClaw│'}</div>
                <div style={{ color: BLUE }}>{'           │Agent 1 │ │Agent 2 │ │Agent 3 │'}</div>
                <div style={{ color: BLUE }}>{'           │:18810  │ │:18811  │ │:18812  │'}</div>
                <div style={{ color: BLUE }}>{'           └────────┘ └────────┘ └────────┘'}</div>
                <div style={{ color: MUTED, marginTop: 12 }}>{'// Paperclip = Company Brain (goals, budgets, governance)'}</div>
                <div style={{ color: MUTED }}>{'// NanoClaw  = Agent Hands  (execution, tools, code)'}</div>
                <div style={{ color: MUTED }}>{'// openclawgateway branch: direct OpenClaw integration'}</div>
              </div>
            </div>

            {/* Key Insight Cards */}
            <div style={glass({ marginBottom: 24 })}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem' }}>🧠 Why Paperclip Fits Clawdet / NanoClaw</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                {[
                  { icon: '🎯', title: 'Agent Orchestration Layer', desc: 'Paperclip sits ABOVE our Docker containers and manages them as a team. Instead of individual agents doing random tasks, they work toward coordinated business goals.', color: G },
                  { icon: '📋', title: 'Goal-Driven Tasks', desc: 'Instead of just chat, agents get assigned goals from the org chart. Product manager agent delegates to developer agent, who delegates to QA agent. Like a real company.', color: BLUE },
                  { icon: '💰', title: 'Cost Control', desc: 'Monthly budgets per agent, auto-pause when budget hit. Solves our Anthropic credit burnout problem — set $50/mo per agent and never overspend.', color: YELLOW },
                  { icon: '💓', title: 'Heartbeat System', desc: 'Agents check in on schedule, get new tasks, report progress. No more "fire and forget" — every agent has a heartbeat cadence and task queue.', color: PURPLE },
                  { icon: '🏢', title: 'Multi-Company', desc: 'Each Clawdet user could run their own "company" of agents. Full isolation: separate org charts, budgets, goals, and governance per company.', color: ORANGE },
                  { icon: '🔌', title: 'OpenClaw Integration', desc: 'Already has an openclawgateway branch on GitHub — direct integration with OpenClaw. Adapters system (packages/adapters/) for plugging in agent runtimes.', color: G },
                ].map(c => (
                  <div key={c.title} style={{ background: 'rgba(255,255,255,.03)', border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16 }}>
                    <div style={{ fontSize: '1.1rem', marginBottom: 8 }}>{c.icon} <strong style={{ color: c.color }}>{c.title}</strong></div>
                    <div style={{ color: MUTED, fontSize: '.82rem', lineHeight: 1.6 }}>{c.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Comparison */}
            <div style={glass({ overflowX: 'auto', marginBottom: 24 })}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem' }}>📊 What Paperclip Adds vs What We Have</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${G}33` }}>
                    <th style={{ textAlign: 'left', padding: '10px 12px', color: MUTED, fontWeight: 700, fontSize: '.72rem', letterSpacing: '.04em', textTransform: 'uppercase' as const, width: '25%' }}>Capability</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', color: ORANGE, fontWeight: 700, fontSize: '.72rem', letterSpacing: '.04em', textTransform: 'uppercase' as const, width: '20%' }}>NanoClaw Today</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', color: BLUE, fontWeight: 700, fontSize: '.72rem', letterSpacing: '.04em', textTransform: 'uppercase' as const, width: '20%' }}>ClawX Fleet Plan</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', color: G, fontWeight: 700, fontSize: '.72rem', letterSpacing: '.04em', textTransform: 'uppercase' as const, width: '35%' }}>+ Paperclip</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { cap: 'Agent Coordination', nano: '❌ None', clawx: '❌ None', paper: '✅ Org chart, role hierarchy, delegation chains' },
                    { cap: 'Task Assignment', nano: '💬 Chat-based', clawx: '💬 Chat-based', paper: '✅ Goal → ticket → agent assignment' },
                    { cap: 'Budget Management', nano: '❌ None', clawx: '❌ None', paper: '✅ Per-agent monthly budgets, auto-pause' },
                    { cap: 'Cost Visibility', nano: '❌ Unknown', clawx: '📊 LLM metrics', paper: '✅ Per-agent, per-goal cost tracking' },
                    { cap: 'Heartbeat / Scheduling', nano: '⚙️ Per-agent config', clawx: '⚙️ Per-agent config', paper: '✅ Centralized heartbeat cadence + task queue' },
                    { cap: 'Multi-Tenant', nano: '✅ Per-container', clawx: '✅ Per-container', paper: '✅ Full company isolation + governance' },
                    { cap: 'Goal Alignment', nano: '❌ None', clawx: '❌ None', paper: '✅ Business goals cascade to agent tasks' },
                    { cap: 'Agent-to-Agent Comms', nano: '❌ None', clawx: '❌ None', paper: '✅ Internal ticket system + delegation' },
                    { cap: 'Container Orchestration', nano: '✅ Docker', clawx: '✅ Docker + migration', paper: '🔄 Delegates to existing Docker infra' },
                    { cap: 'Observability', nano: '❌ Manual', clawx: '✅ Prometheus + Grafana', paper: '✅ + agent performance dashboards' },
                  ].map((r, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${BORDER}33` }}>
                      <td style={{ padding: '12px', fontWeight: 600, fontSize: '.83rem' }}>{r.cap}</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '.8rem' }}>{r.nano}</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '.8rem' }}>{r.clawx}</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '.8rem', color: G }}>{r.paper}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Integration Plan */}
            <div style={glass({ marginBottom: 24 })}>
              <h3 style={{ margin: '0 0 20px', fontSize: '1.05rem' }}>🔧 Integration Plan: Paperclip + NanoClaw Fleet</h3>
              <div style={{ position: 'relative', paddingLeft: 36 }}>
                <div style={{ position: 'absolute', left: 14, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${BLUE}, ${G}, ${PURPLE}, ${ORANGE})` }} />
                {[
                  { step: 'Step 1', title: 'Deploy Paperclip alongside Clawdet', color: BLUE, items: [
                    'docker-compose up on port 3100 with PostgreSQL',
                    'Caddy reverse proxy: paperclip.clawdet.com → :3100',
                    'Create first "company" with org chart',
                    'Initial cost: 0 (self-hosted, ~256MB RAM)',
                  ]},
                  { step: 'Step 2', title: 'Connect via openclawgateway adapter', color: G, items: [
                    'Use the openclawgateway branch for native OpenClaw integration',
                    'Register each NanoClaw container as an "agent" in Paperclip',
                    'Map Docker containers → Paperclip agent roster',
                    'Configure heartbeat endpoints per agent',
                  ]},
                  { step: 'Step 3', title: 'Define goals + org chart', color: PURPLE, items: [
                    'Create agent roles: Developer, Researcher, Ops, QA',
                    'Set business goals that cascade to agent tasks',
                    'Configure budget limits per agent ($50-200/mo)',
                    'Set up delegation chains (product → dev → QA)',
                  ]},
                  { step: 'Step 4', title: 'Full production workflow', color: ORANGE, items: [
                    'User sets business goal in Paperclip UI',
                    'Paperclip decomposes into tickets, assigns to agents',
                    'Agents execute via NanoClaw containers (tools, code, web)',
                    'Results flow back through heartbeat check-ins',
                    'Budget tracking prevents overspend, auto-pause on limit',
                  ]},
                ].map((p, i) => (
                  <div key={i} style={{ marginBottom: 20, position: 'relative' }}>
                    <div style={{
                      position: 'absolute', left: -29, top: 6, width: 16, height: 16, borderRadius: '50%',
                      background: p.color, border: `3px solid ${BG}`, boxShadow: `0 0 12px ${p.color}44`,
                    }} />
                    <div style={{ background: 'rgba(255,255,255,.03)', border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                        <span style={badge(p.color)}>{p.step}</span>
                        <strong style={{ fontSize: '.95rem' }}>{p.title}</strong>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 2, fontSize: '.85rem' }}>
                        {p.items.map(item => (
                          <li key={item} style={{ color: MUTED }}>
                            <span style={{ color: TEXT }}>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Flow */}
            <div style={glass({ marginBottom: 24 })}>
              <h3 style={{ margin: '0 0 20px', fontSize: '1.05rem' }}>🔄 Full Flow: User → Paperclip → NanoClaw Agents</h3>
              <div style={{ ...mono, background: '#0d1117', borderRadius: 10, padding: 24, overflowX: 'auto', lineHeight: 2 }}>
                <div style={{ color: YELLOW, fontWeight: 700 }}>{'  👤 User: "Build me a landing page for product X"'}</div>
                <div style={{ color: MUTED }}>{'     │'}</div>
                <div style={{ color: MUTED }}>{'     ▼'}</div>
                <div style={{ color: G, fontWeight: 700 }}>{'  📎 Paperclip (Company Brain)'}</div>
                <div style={{ color: G }}>{'     ├── Decomposes goal into tickets'}</div>
                <div style={{ color: G }}>{'     ├── Checks budget ($47/$200 used this month)'}</div>
                <div style={{ color: G }}>{'     ├── Consults org chart for assignments'}</div>
                <div style={{ color: G }}>{'     └── Dispatches to agents:'}</div>
                <div style={{ color: MUTED }}>{'         │'}</div>
                <div style={{ color: MUTED }}>{'         ├─────────────────┬─────────────────┐'}</div>
                <div style={{ color: MUTED }}>{'         │                 │                 │'}</div>
                <div style={{ color: BLUE }}>{'    ┌────▼─────┐    ┌─────▼────┐    ┌────▼─────┐'}</div>
                <div style={{ color: BLUE }}>{'    │ 🎨 Agent │    │ 💻 Agent │    │ 🧪 Agent │'}</div>
                <div style={{ color: BLUE }}>{'    │ Designer │    │   Dev    │    │    QA    │'}</div>
                <div style={{ color: BLUE }}>{'    │  :18810  │    │  :18811  │    │  :18812  │'}</div>
                <div style={{ color: BLUE }}>{'    └────┬─────┘    └─────┬────┘    └────┬─────┘'}</div>
                <div style={{ color: MUTED }}>{'         │                 │                 │'}</div>
                <div style={{ color: PURPLE }}>{'    Mockup done ✓    Code done ✓     Tests pass ✓'}</div>
                <div style={{ color: MUTED }}>{'         │                 │                 │'}</div>
                <div style={{ color: MUTED }}>{'         └─────────────────┴─────────────────┘'}</div>
                <div style={{ color: MUTED }}>{'                          │'}</div>
                <div style={{ color: MUTED }}>{'                          ▼'}</div>
                <div style={{ color: G, fontWeight: 700 }}>{'  📎 Paperclip: Goal complete! Cost: $12.40'}</div>
                <div style={{ color: G }}>{'     └── Updates budget, logs results, notifies user'}</div>
              </div>
            </div>

            {/* Key Insight */}
            <div style={glass({ borderColor: `${G}44` })}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>📎</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: G, marginBottom: 8 }}>Paperclip</div>
                  <div style={{ color: TEXT, fontWeight: 600, marginBottom: 8 }}>The Company Brain</div>
                  <div style={{ color: MUTED, fontSize: '.82rem', lineHeight: 1.6 }}>
                    Goals · Org Charts · Budgets · Governance · Task Decomposition · Agent Coordination · Cost Control
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <a href="https://github.com/paperclipai/paperclip" target="_blank" rel="noopener noreferrer" style={{ color: G, fontSize: '.82rem', textDecoration: 'none', fontWeight: 600 }}>
                      github.com/paperclipai/paperclip →
                    </a>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                  <div style={{ fontSize: '2rem', color: G }}>+</div>
                </div>
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>🐾</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: BLUE, marginBottom: 8 }}>NanoClaw</div>
                  <div style={{ color: TEXT, fontWeight: 600, marginBottom: 8 }}>The Agent Hands</div>
                  <div style={{ color: MUTED, fontSize: '.82rem', lineHeight: 1.6 }}>
                    Execution · Tools · Code · Web Browsing · File Ops · Shell Commands · Docker Containers
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 20, padding: 16, background: 'rgba(46,230,138,.06)', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: G }}>
                  Together: A full AI company where the brain (Paperclip) directs the hands (NanoClaw) toward business outcomes — with budgets, governance, and accountability built in.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ─── Footer ──────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${BORDER}`, padding: '24px', textAlign: 'center', color: MUTED, fontSize: '.78rem' }}>
        <div>Clawdet Fleet Management Plan · Based on ClawX Production Architecture (58+ agents, 3 nodes)</div>
        <div style={{ marginTop: 4 }}>March 2026 · <span style={{ color: G }}>Practical migration path from single-node to multi-node fleet</span></div>
      </footer>
    </div>
  );
}
