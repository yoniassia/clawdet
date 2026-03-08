'use client';
import Link from 'next/link';

const reports = [
  {
    href: '/tech/scaling',
    icon: '📊',
    title: 'Scaling Cost Analysis',
    desc: 'Infrastructure cost comparison for scaling AI agents at 5K, 50K, and 500K instances. Covers Hetzner, AWS, Azure, GCP, and more.',
    badge: 'Feb 2026',
    badgeColor: '#2EE68A',
  },
  {
    href: '/tech/security',
    icon: '🛡️',
    title: 'Security & Architecture',
    desc: 'Multi-tenant isolation models, open source project evaluation, architecture diagrams, and comprehensive threat analysis.',
    badge: 'Feb 2026',
    badgeColor: '#2EE68A',
  },
  {
    href: '/tech/models',
    icon: '🐾',
    title: 'Claw Alternatives Compared',
    desc: 'The Six Claws — comprehensive comparison of OpenClaw, NanoClaw, IronClaw, PicoClaw, ZeroClaw, and Nanobot.',
    badge: 'Feb 2026',
    badgeColor: '#2EE68A',
  },
  {
    href: '/tech/strategy',
    icon: '🎯',
    title: 'Strategic Analysis',
    desc: 'Consolidated decision framework combining infrastructure, architecture, and claw model dimensions.',
    badge: 'Feb 2026',
    badgeColor: '#2EE68A',
  },
];

export default function TechPage() {
  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#e6edf3', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" }}>
      {/* Nav */}
      <nav style={{ background: '#161b22', borderBottom: '1px solid #30363d', padding: '12px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link href="/" style={{ color: '#2EE68A', fontWeight: 700, fontSize: '1.1rem', textDecoration: 'none' }}>🐾 Clawdet</Link>
          <Link href="/dashboard" style={{ color: '#8b949e', fontSize: '.875rem', padding: '6px 12px', borderRadius: 6, textDecoration: 'none' }}>Dashboard</Link>
          <Link href="/nanofleets" style={{ color: '#8b949e', fontSize: '.875rem', padding: '6px 12px', borderRadius: 6, textDecoration: 'none' }}>NanoFleets</Link>
          <Link href="/tech" style={{ color: '#2EE68A', fontSize: '.875rem', padding: '6px 12px', borderRadius: 6, textDecoration: 'none', fontWeight: 600, border: '1px solid #2EE68A', background: 'rgba(46,230,138,.08)' }}>Tech</Link>
        </div>
      </nav>

      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #161b22 50%, #1a1e2e 100%)', borderBottom: '1px solid #30363d', padding: '60px 0', textAlign: 'center' as const }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <h1 style={{ fontSize: '2.8rem', background: 'linear-gradient(135deg, #2EE68A, #bc8cff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 12 }}>
            Technical Deep Dives
          </h1>
          <p style={{ color: '#8b949e', fontSize: '1.2rem', maxWidth: 600, margin: '0 auto' }}>
            In-depth research on infrastructure, security, and AI agent platform architecture
          </p>
        </div>
      </header>

      {/* Cards */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
          {reports.map((r) => (
            <Link key={r.href} href={r.href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#161b22',
                border: '1px solid #30363d',
                borderRadius: 12,
                padding: 28,
                transition: 'border-color .2s, transform .2s',
                cursor: 'pointer',
                height: '100%',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#2EE68A'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#30363d'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
              >
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>{r.icon}</div>
                <h3 style={{ color: '#e6edf3', fontSize: '1.3rem', marginBottom: 8 }}>{r.title}</h3>
                <p style={{ color: '#8b949e', fontSize: '.95rem', lineHeight: 1.6, marginBottom: 16 }}>{r.desc}</p>
                <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: '.75rem', fontWeight: 600, background: 'rgba(46,230,138,.15)', color: '#2EE68A' }}>{r.badge}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding: '32px 0', textAlign: 'center' as const, color: '#8b949e', fontSize: '.85rem', borderTop: '1px solid #30363d' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <p>Clawdet Technical Research · 2026</p>
          <p style={{ marginTop: 4 }}>
            <Link href="/" style={{ color: '#2EE68A', textDecoration: 'none' }}>clawdet.com</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
