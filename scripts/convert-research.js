#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'research-source');
const appDir = path.join(__dirname, '..', 'app', 'tech');

// Mapping: source file -> route folder, title, description
const pages = [
  { src: 'cost-analysis.html', route: 'scaling', title: 'Scaling Cost Analysis', desc: 'Infrastructure cost comparison for scaling AI agents at 5K, 50K, and 500K instances' },
  { src: 'security.html', route: 'security', title: 'Security & Architecture', desc: 'Multi-tenant isolation models, open source evaluation, and threat analysis' },
  { src: 'models.html', route: 'models', title: 'Claw Alternatives Compared', desc: 'Comprehensive comparison of 6 open-source AI agent platforms' },
  { src: 'alternatives.html', route: 'strategy', title: 'Strategic Analysis', desc: 'Infrastructure × Architecture × Claw Model decision framework' },
];

function rebrand(text) {
  return text
    // Replace MoneyClaw with Clawdet
    .replace(/MoneyClaw/g, 'Clawdet')
    .replace(/moneyclaw/g, 'clawdet')
    .replace(/MONEYCLAW/g, 'CLAWDET')
    // Replace CEO Brief with Technical Deep Dive
    .replace(/CEO Brief/g, 'Technical Deep Dive')
    .replace(/CEO/g, 'Technical')
    // Replace accent color
    .replace(/#58a6ff/g, '#2EE68A')
    .replace(/rgba\(88,166,255/g, 'rgba(46,230,138')
    // Replace moneyclaw.com references
    .replace(/moneyclaw\.com/g, 'clawdet.com')
    .replace(/https:\/\/clawdet\.com/g, 'https://clawdet.com');
}

function extractCSS(html) {
  const match = html.match(/<style>([\s\S]*?)<\/style>/);
  return match ? match[1] : '';
}

function extractBody(html) {
  // Get everything between <body> and </body>
  const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/);
  if (!bodyMatch) return '';
  let body = bodyMatch[1];
  
  // Remove auth-wall div
  body = body.replace(/<div id="auth-wall">[\s\S]*?<\/div>\s*<\/div>/g, '');
  // Also try simpler pattern
  body = body.replace(/<div id="auth-wall">[\s\S]*?<\/div>\n/g, '');
  
  // Remove the auth script
  body = body.replace(/<script>[\s\S]*?<\/script>/g, '');
  
  return body;
}

function cleanBodyContent(body) {
  // Remove the old nav entirely - we'll add Clawdet nav in React
  body = body.replace(/<nav>[\s\S]*?<\/nav>/g, '');
  
  // Remove the old footer - we'll add Clawdet footer in React
  body = body.replace(/<footer>[\s\S]*?<\/footer>/g, '');
  
  // Remove the old header but keep main content
  // Actually, keep the header but rebrand it
  
  return body.trim();
}

function escapeForTemplate(str) {
  // Escape backticks and ${} for template literals
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

// Create the tech index page
function createIndexPage() {
  const content = `'use client';
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
`;
  const dir = path.join(appDir);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'page.tsx'), content);
  console.log('Created tech index page');
}

// Create content pages
function createContentPage(page) {
  const html = fs.readFileSync(path.join(srcDir, page.src), 'utf-8');
  
  let css = extractCSS(html);
  let body = extractBody(html);
  body = cleanBodyContent(body);
  
  // Apply rebranding
  css = rebrand(css);
  body = rebrand(body);
  
  // Update CSS: change bg color and remove auth-wall styles
  css = css.replace(/--bg:#0d1117/g, '--bg:#0a0a0a');
  // Remove all #auth-wall CSS rules
  css = css.replace(/#auth-wall[^}]*\{[^}]*\}/g, '');
  // Fix sticky nav top position to account for Clawdet nav
  css = css.replace(/position:sticky;top:0/g, 'position:sticky;top:52px');
  
  // Remove internal HTML links to other pages and replace with Next.js routes
  body = body.replace(/href="index\.html"/g, 'href="/tech/scaling"');
  body = body.replace(/href="cost-analysis\.html"/g, 'href="/tech/scaling"');
  body = body.replace(/href="security\.html"/g, 'href="/tech/security"');
  body = body.replace(/href="models\.html"/g, 'href="/tech/models"');
  body = body.replace(/href="alternatives\.html"/g, 'href="/tech/strategy"');
  body = body.replace(/href="clawdetv1\.html"/g, 'href="/tech/strategy"');
  body = body.replace(/href="moneyclawv1\.html"/g, 'href="/tech/strategy"');
  body = body.replace(/href="orchestration\.html"/g, '#');
  
  // Escape for template literal
  css = escapeForTemplate(css);
  body = escapeForTemplate(body);
  
  const content = `'use client';
import Link from 'next/link';

export default function ${page.route.charAt(0).toUpperCase() + page.route.slice(1)}Page() {
  const cssContent = \`${css}\`;
  
  const bodyContent = \`${body}\`;

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: cssContent }} />
      
      {/* Clawdet Nav */}
      <nav style={{ background: '#161b22', borderBottom: '1px solid #30363d', padding: '12px 0', position: 'sticky', top: 0, zIndex: 200 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 16, alignItems: 'center', overflowX: 'auto', whiteSpace: 'nowrap' as const }}>
          <Link href="/" style={{ color: '#2EE68A', fontWeight: 700, fontSize: '1.1rem', textDecoration: 'none', flexShrink: 0 }}>🐾 Clawdet</Link>
          <Link href="/dashboard" style={{ color: '#8b949e', fontSize: '.875rem', padding: '6px 12px', borderRadius: 6, textDecoration: 'none' }}>Dashboard</Link>
          <Link href="/nanofleets" style={{ color: '#8b949e', fontSize: '.875rem', padding: '6px 12px', borderRadius: 6, textDecoration: 'none' }}>NanoFleets</Link>
          <Link href="/tech" style={{ color: '#2EE68A', fontSize: '.875rem', padding: '6px 12px', borderRadius: 6, textDecoration: 'none', fontWeight: 600, border: '1px solid #2EE68A', background: 'rgba(46,230,138,.08)' }}>Tech</Link>
          <span style={{ color: '#30363d', flexShrink: 0 }}>|</span>
          <Link href="/tech/scaling" style={{ color: '${page.route === 'scaling' ? '#2EE68A' : '#8b949e'}', fontSize: '.875rem', padding: '6px 12px', borderRadius: 6, textDecoration: 'none' }}>📊 Scaling</Link>
          <Link href="/tech/security" style={{ color: '${page.route === 'security' ? '#2EE68A' : '#8b949e'}', fontSize: '.875rem', padding: '6px 12px', borderRadius: 6, textDecoration: 'none' }}>🛡️ Security</Link>
          <Link href="/tech/models" style={{ color: '${page.route === 'models' ? '#2EE68A' : '#8b949e'}', fontSize: '.875rem', padding: '6px 12px', borderRadius: 6, textDecoration: 'none' }}>🐾 Models</Link>
          <Link href="/tech/strategy" style={{ color: '${page.route === 'strategy' ? '#2EE68A' : '#8b949e'}', fontSize: '.875rem', padding: '6px 12px', borderRadius: 6, textDecoration: 'none' }}>🎯 Strategy</Link>
        </div>
      </nav>

      {/* Page Content */}
      <div dangerouslySetInnerHTML={{ __html: bodyContent }} />

      {/* Clawdet Footer */}
      <footer style={{ padding: '32px 0', textAlign: 'center' as const, color: '#8b949e', fontSize: '.85rem', borderTop: '1px solid #30363d' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <p>Clawdet Technical Research · 2026</p>
          <p style={{ marginTop: 4 }}>
            <a href="/" style={{ color: '#2EE68A', textDecoration: 'none' }}>clawdet.com</a>
            {' · '}
            <a href="/tech" style={{ color: '#2EE68A', textDecoration: 'none' }}>← All Reports</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
`;

  const dir = path.join(appDir, page.route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'page.tsx'), content);
  console.log(`Created ${page.route} page`);
}

// Run
createIndexPage();
pages.forEach(createContentPage);
console.log('Done! All tech pages created.');
