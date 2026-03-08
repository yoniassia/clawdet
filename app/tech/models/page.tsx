'use client';
import Link from 'next/link';

export default function ModelsPage() {
  const cssContent = `
:root{--bg:#0a0a0a;--surface:#161b22;--surface2:#1c2333;--border:#30363d;--text:#e6edf3;--text-muted:#8b949e;--accent:#2EE68A;--accent2:#3fb950;--accent3:#f0883e;--danger:#f85149;--purple:#bc8cff}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;background:var(--bg);color:var(--text);line-height:1.6}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
.container{max-width:1200px;margin:0 auto;padding:0 24px}
header{background:linear-gradient(135deg,#0d1117 0%,#161b22 50%,#1a1e2e 100%);border-bottom:1px solid var(--border);padding:40px 0;text-align:center}
header h1{font-size:2.4rem;background:linear-gradient(135deg,var(--accent),var(--purple));-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px}
header p{color:var(--text-muted);font-size:1.1rem}
.badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:.75rem;font-weight:600;margin:4px}
.badge-blue{background:rgba(46,230,138,.15);color:var(--accent)}
.badge-green{background:rgba(63,185,80,.15);color:var(--accent2)}
.badge-orange{background:rgba(240,136,62,.15);color:var(--accent3)}
.badge-red{background:rgba(248,81,73,.15);color:var(--danger)}
.badge-purple{background:rgba(188,140,255,.15);color:var(--purple)}
nav{background:var(--surface);border-bottom:1px solid var(--border);padding:12px 0;position:sticky;top:52px;z-index:100}
nav .container{display:flex;gap:16px;overflow-x:auto;white-space:nowrap;scrollbar-width:none}
nav a{color:var(--text-muted);font-size:.875rem;padding:6px 12px;border-radius:6px;transition:all .2s}
nav a:hover{color:var(--text);background:var(--surface2);text-decoration:none}
nav a.nav-page{color:var(--accent);font-weight:600;border:1px solid var(--accent);background:rgba(46,230,138,.08)}
section{padding:48px 0;border-bottom:1px solid var(--border)}
h2{font-size:1.8rem;margin-bottom:24px;display:flex;align-items:center;gap:12px}
h3{font-size:1.3rem;margin:24px 0 12px;color:var(--accent)}
h4{font-size:1.1rem;margin:16px 0 8px;color:var(--text)}
.card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px;margin:16px 0}
.card-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:16px}
table{width:100%;border-collapse:collapse;margin:16px 0;font-size:.9rem}
th,td{padding:12px 16px;text-align:left;border-bottom:1px solid var(--border)}
th{background:var(--surface2);color:var(--accent);font-weight:600;position:sticky;top:52px}
tr:hover{background:rgba(46,230,138,.04)}
.highlight-row{background:rgba(63,185,80,.08)!important}
.rec{background:linear-gradient(135deg,rgba(63,185,80,.15),rgba(63,185,80,.05));border:1px solid rgba(63,185,80,.3);border-radius:12px;padding:20px 24px;margin:16px 0}
.rec h4{color:var(--accent2);margin-top:0}
.warn{background:linear-gradient(135deg,rgba(240,136,62,.15),rgba(240,136,62,.05));border:1px solid rgba(240,136,62,.3);border-radius:12px;padding:20px 24px;margin:16px 0}
.danger-box{background:linear-gradient(135deg,rgba(248,81,73,.15),rgba(248,81,73,.05));border:1px solid rgba(248,81,73,.3);border-radius:12px;padding:20px 24px;margin:16px 0}
.danger-box h4{color:var(--danger);margin-top:0}
ul{margin:8px 0 8px 24px}li{margin:4px 0}
footer{padding:32px 0;text-align:center;color:var(--text-muted);font-size:.85rem}
.chart-bar{display:flex;align-items:center;gap:12px;margin:6px 0}
.chart-label{width:120px;font-size:.85rem;text-align:right;flex-shrink:0}
.chart-value{font-size:.85rem;color:var(--text-muted);min-width:80px}
.chart-fill{height:28px;border-radius:4px;transition:width .6s ease}
.chart-track{flex:1;background:var(--surface2);border-radius:4px;overflow:hidden;height:28px}
.claw-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px;margin:16px 0;transition:border-color .2s}
.claw-card:hover{border-color:var(--accent)}
.claw-card h3{margin-top:0;display:flex;align-items:center;gap:10px}
.claw-card .meta{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}
.pros-cons{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:12px}
.pros h4{color:var(--accent2)}
.cons h4{color:var(--danger)}
.feature-check{color:var(--accent2)}
.feature-x{color:var(--danger)}
.feature-partial{color:var(--accent3)}
.collapse-btn{background:var(--surface2);border:1px solid var(--border);color:var(--text-muted);padding:6px 14px;border-radius:6px;cursor:pointer;font-size:.85rem;transition:all .2s}
.collapse-btn:hover{color:var(--text);border-color:var(--accent)}
.collapse-content{max-height:0;overflow:hidden;transition:max-height .3s ease}
.collapse-content.open{max-height:2000px}
@media(max-width:768px){
.card-grid{grid-template-columns:1fr}
.pros-cons{grid-template-columns:1fr}
nav .container{gap:8px}
header h1{font-size:1.6rem}
h2{font-size:1.4rem}
table{font-size:.8rem}
th,td{padding:8px}
.chart-label{width:80px;font-size:.75rem}
}






`;
  
  const bodyContent = `<header>
<div class="container">
<h1>🐾 The Six Claws — Alternatives Compared</h1>
<p>Comprehensive comparison of open-source AI agent platforms</p>
<div style="margin-top:12px">
<span class="badge badge-blue">Feb 2026</span>
<span class="badge badge-green">v1.0</span>
<span class="badge badge-purple">Technical Deep Dive</span>
<span class="badge badge-orange">Source: @MisbahSy</span>
</div>
</div>
</header>



<main>

<!-- MASTER COMPARISON TABLE -->
<section id="comparison-table">
<div class="container">
<h2>📋 Master Comparison Table</h2>
<div style="overflow-x:auto">
<table>
<thead>
<tr>
<th>Attribute</th>
<th style="border-left:2px solid var(--accent2)">OpenClaw ⭐</th>
<th>NanoClaw</th>
<th>Nanobot</th>
<th>IronClaw</th>
<th>PicoClaw</th>
<th>ZeroClaw</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Language</strong></td>
<td style="border-left:2px solid var(--accent2)">TypeScript</td>
<td>TypeScript</td>
<td>Python</td>
<td>Rust</td>
<td>Go</td>
<td>Rust</td>
</tr>
<tr>
<td><strong>Lines of Code</strong></td>
<td style="border-left:2px solid var(--accent2)">~400K</td>
<td>~500</td>
<td>~4,000</td>
<td>~15K</td>
<td>~8K</td>
<td>~12K</td>
</tr>
<tr>
<td><strong>GitHub Stars</strong></td>
<td style="border-left:2px solid var(--accent2)">200K+</td>
<td>5K</td>
<td>15K</td>
<td>8K</td>
<td>3K</td>
<td>6K</td>
</tr>
<tr>
<td><strong>Memory Usage</strong></td>
<td style="border-left:2px solid var(--accent2)"><span style="color:var(--danger)">~1.5GB</span></td>
<td>~50MB/container</td>
<td><span style="color:var(--accent3)">~100MB</span></td>
<td><span style="color:var(--accent2)">~7.8MB</span></td>
<td><span style="color:var(--accent2)">&lt;10MB</span></td>
<td><span style="color:var(--accent2)">&lt;5MB</span></td>
</tr>
<tr>
<td><strong>Startup Time</strong></td>
<td style="border-left:2px solid var(--accent2)"><span style="color:var(--danger)">~6s</span></td>
<td>~3s</td>
<td><span style="color:var(--accent3)">~0.8s</span></td>
<td><span style="color:var(--accent2)">&lt;10ms</span></td>
<td>~100ms</td>
<td><span style="color:var(--accent2)">&lt;10ms</span></td>
</tr>
<tr>
<td><strong>Binary/Install</strong></td>
<td style="border-left:2px solid var(--accent2)">~500MB</td>
<td>~5MB</td>
<td>~50MB</td>
<td><span style="color:var(--accent2)">3.4MB</span></td>
<td>~8MB</td>
<td><span style="color:var(--accent2)">3.4MB</span></td>
</tr>
<tr>
<td><strong>Messaging Platforms</strong></td>
<td style="border-left:2px solid var(--accent2)"><span style="color:var(--accent2)">11+</span></td>
<td><span style="color:var(--danger)">1 (WhatsApp)</span></td>
<td>9+</td>
<td>5+</td>
<td>6</td>
<td>8+</td>
</tr>
<tr>
<td><strong>LLM Providers</strong></td>
<td style="border-left:2px solid var(--accent2)">20+</td>
<td><span style="color:var(--danger)">1 (Claude)</span></td>
<td>12+</td>
<td>10+</td>
<td>Multiple</td>
<td><span style="color:var(--accent2)">22+</span></td>
</tr>
<tr>
<td><strong>Security Model</strong></td>
<td style="border-left:2px solid var(--accent2)"><span style="color:var(--accent3)">Application-level</span></td>
<td><span style="color:var(--accent2)">OS-level containers</span></td>
<td>MCP isolation</td>
<td><span style="color:var(--accent2)">5-layer stack</span></td>
<td><span style="color:var(--danger)">Pre-v1.0 ⚠️</span></td>
<td>Trait boundaries</td>
</tr>
<tr>
<td><strong>Skill System</strong></td>
<td style="border-left:2px solid var(--accent2)">ClawHub (5,700+)</td>
<td>Code-as-config</td>
<td>MCP tool servers</td>
<td>WASM plugins</td>
<td>Basic plugins</td>
<td>Trait implementations</td>
</tr>
<tr>
<td><strong>Best For</strong></td>
<td style="border-left:2px solid var(--accent2)"><em>Production SaaS</em></td>
<td><em>Security-first personal</em></td>
<td><em>Dev/research</em></td>
<td><em>Enterprise/regulated</em></td>
<td><em>IoT/edge</em></td>
<td><em>Vendor-neutral teams</em></td>
</tr>
</tbody>
</table>
</div>
</div>
</section>

<!-- DETAILED CLAW PROFILES -->
<section id="claw-cards">
<div class="container">
<h2>🐾 Detailed Profiles</h2>

<!-- OpenClaw -->
<div class="claw-card" style="border-color:var(--accent2)">
<h3><span style="font-size:1.5rem">🐾</span> OpenClaw <span class="badge badge-green">OUR PLATFORM</span></h3>
<div class="meta">
<span class="badge badge-blue">TypeScript</span>
<span class="badge badge-purple">400K+ lines</span>
<span class="badge badge-green">200K+ ⭐</span>
<span class="badge badge-orange">1.5GB RAM</span>
</div>
<p><strong>Architecture:</strong> Three-layer hub-and-spoke — Gateway receives all messages, Channel Adapters normalize platform protocols, Agent Runtime executes skills with LLM reasoning. ClawHub marketplace provides 5,700+ skills.</p>
<p><a href="https://github.com/openclaw/openclaw">github.com/openclaw/openclaw</a></p>
<div class="pros-cons">
<div class="pros"><h4>✅ Pros</h4>
<ul>
<li>Largest ecosystem (200K+ stars)</li>
<li>11+ messaging platforms</li>
<li>5,700+ skills on ClawHub</li>
<li>Active community & development</li>
<li>Proven at scale</li>
</ul>
</div>
<div class="cons"><h4>❌ Cons</h4>
<ul>
<li>~400K lines — "vibe-coded monster" (Karpathy)</li>
<li>1.5GB memory footprint</li>
<li>6s startup time</li>
<li>Application-level security only</li>
<li>Complex to audit or contribute</li>
</ul>
</div>
</div>
</div>

<!-- NanoClaw -->
<div class="claw-card">
<h3><span style="font-size:1.5rem">🔬</span> NanoClaw</h3>
<div class="meta">
<span class="badge badge-blue">TypeScript</span>
<span class="badge badge-green">~500 lines</span>
<span class="badge badge-purple">OS-level security</span>
</div>
<p><strong>Architecture:</strong> Each WhatsApp group gets its own isolated Linux container (Apple Container on macOS, Docker on Linux). Uses Claude Agent SDK exclusively. Skills modify the source code directly — "skills as config" pattern praised by Karpathy.</p>
<p><a href="https://github.com/qwibitai/nanoclaw">github.com/qwibitai/nanoclaw</a></p>
<div class="pros-cons">
<div class="pros"><h4>✅ Pros</h4>
<ul>
<li>Fully auditable (500 lines!)</li>
<li>OS-level isolation per group</li>
<li>Elegant "skills as config" approach</li>
<li>Karpathy endorsed</li>
</ul>
</div>
<div class="cons"><h4>❌ Cons</h4>
<ul>
<li>WhatsApp only</li>
<li>Claude only (no LLM choice)</li>
<li>No skill marketplace</li>
<li>Limited scalability</li>
</ul>
</div>
</div>
</div>

<!-- Nanobot -->
<div class="claw-card">
<h3><span style="font-size:1.5rem">🤖</span> Nanobot</h3>
<div class="meta">
<span class="badge badge-blue">Python</span>
<span class="badge badge-green">~4K lines</span>
<span class="badge badge-purple">MCP-first</span>
<span class="badge badge-orange">HKU Lab</span>
</div>
<p><strong>Architecture:</strong> MCP-first thin orchestrator. All capabilities come via MCP tool servers — the agent itself is minimal. AgentLoop runs with a 20-iteration safety cap. From HKU Data Intelligence Lab.</p>
<p><a href="https://github.com/HKUDS/nanobot">github.com/HKUDS/nanobot</a></p>
<div class="pros-cons">
<div class="pros"><h4>✅ Pros</h4>
<ul>
<li>Clean, hackable codebase</li>
<li>MCP-native (future-proof)</li>
<li>0.8s startup, 100MB RAM</li>
<li>Python ecosystem access</li>
<li>9+ platforms, 12+ LLMs</li>
</ul>
</div>
<div class="cons"><h4>❌ Cons</h4>
<ul>
<li>Younger project</li>
<li>Smaller community</li>
<li>MCP ecosystem still growing</li>
<li>Python performance ceiling</li>
</ul>
</div>
</div>
</div>

<!-- IronClaw -->
<div class="claw-card">
<h3><span style="font-size:1.5rem">🛡️</span> IronClaw</h3>
<div class="meta">
<span class="badge badge-blue">Rust</span>
<span class="badge badge-green">3.4MB binary</span>
<span class="badge badge-purple">NEAR AI</span>
<span class="badge badge-red">5-layer security</span>
</div>
<p><strong>Architecture:</strong> Five-layer security stack: TLS 1.3 → Request filtering → AES-256-GCM credential encryption → WASM sandbox for skills → Docker isolation for runtime. PostgreSQL + pgvector for hybrid RRF memory search.</p>
<p><a href="https://github.com/nearai/ironclaw">github.com/nearai/ironclaw</a></p>
<div class="pros-cons">
<div class="pros"><h4>✅ Pros</h4>
<ul>
<li>Best-in-class security (5 layers)</li>
<li>7.8MB memory, &lt;10ms startup</li>
<li>Rust safety guarantees</li>
<li>WASM skill sandboxing</li>
<li>Enterprise-grade design</li>
</ul>
</div>
<div class="cons"><h4>❌ Cons</h4>
<ul>
<li>Rust learning curve</li>
<li>Smaller platform support (5+)</li>
<li>Smaller ecosystem</li>
<li>Newer project</li>
</ul>
</div>
</div>
</div>

<!-- PicoClaw -->
<div class="claw-card">
<h3><span style="font-size:1.5rem">📟</span> PicoClaw</h3>
<div class="meta">
<span class="badge badge-blue">Go</span>
<span class="badge badge-green">&lt;10MB RAM</span>
<span class="badge badge-orange">95% AI-coded</span>
<span class="badge badge-red">Pre-v1.0 ⚠️</span>
</div>
<p><strong>Architecture:</strong> Minimal Go runtime designed for edge devices and IoT. Runs on $10 hardware including RISC-V, ARM, and x86. 95% of the codebase was AI-bootstrapped. Supports Telegram, Discord, QQ, DingTalk, LINE, WeChat.</p>
<p><a href="https://github.com/sipeed/picoclaw">github.com/sipeed/picoclaw</a></p>
<div class="pros-cons">
<div class="pros"><h4>✅ Pros</h4>
<ul>
<li>Runs on $10 hardware</li>
<li>RISC-V, ARM, x86 support</li>
<li>&lt;10MB RAM</li>
<li>6 messaging platforms</li>
<li>IoT-ready</li>
</ul>
</div>
<div class="cons"><h4>❌ Cons</h4>
<ul>
<li>Pre-v1.0 — not production-ready</li>
<li>Unresolved network security issues</li>
<li>95% AI-generated code quality concerns</li>
<li>Basic plugin system</li>
</ul>
</div>
</div>
</div>

<!-- ZeroClaw -->
<div class="claw-card">
<h3><span style="font-size:1.5rem">🔄</span> ZeroClaw</h3>
<div class="meta">
<span class="badge badge-blue">Rust</span>
<span class="badge badge-green">&lt;5MB RAM</span>
<span class="badge badge-purple">13 core traits</span>
<span class="badge badge-orange">22+ LLMs</span>
</div>
<p><strong>Architecture:</strong> Trait-driven — 13 core traits abstract every subsystem (messaging, LLM, memory, tools, etc.). Swap any component without code changes. Hybrid vector+keyword search in SQLite. 3.4MB binary, &lt;10ms startup.</p>
<p><a href="https://github.com/zeroclaw-labs/zeroclaw">github.com/zeroclaw-labs/zeroclaw</a></p>
<div class="pros-cons">
<div class="pros"><h4>✅ Pros</h4>
<ul>
<li>Zero vendor lock-in</li>
<li>22+ LLM providers (most of any claw)</li>
<li>Swap any component via traits</li>
<li>&lt;5MB memory, &lt;10ms startup</li>
<li>SQLite-based (no external DB needed)</li>
</ul>
</div>
<div class="cons"><h4>❌ Cons</h4>
<ul>
<li>Complex trait system</li>
<li>Smaller community</li>
<li>Steeper learning curve</li>
<li>Newer project</li>
</ul>
</div>
</div>
</div>

</div>
</section>

<!-- PERFORMANCE COMPARISON -->
<section id="performance">
<div class="container">
<h2>⚡ Performance Comparison</h2>

<h3>Memory Usage</h3>
<div class="card">
<div class="chart-bar">
<div class="chart-label">OpenClaw</div>
<div class="chart-track"><div class="chart-fill" style="width:100%;background:var(--danger)"></div></div>
<div class="chart-value">1,500 MB</div>
</div>
<div class="chart-bar">
<div class="chart-label">Nanobot</div>
<div class="chart-track"><div class="chart-fill" style="width:6.7%;background:var(--accent3)"></div></div>
<div class="chart-value">100 MB</div>
</div>
<div class="chart-bar">
<div class="chart-label">NanoClaw</div>
<div class="chart-track"><div class="chart-fill" style="width:3.3%;background:var(--accent)"></div></div>
<div class="chart-value">50 MB/ctr</div>
</div>
<div class="chart-bar">
<div class="chart-label">PicoClaw</div>
<div class="chart-track"><div class="chart-fill" style="width:0.7%;background:var(--accent2)"></div></div>
<div class="chart-value">&lt;10 MB</div>
</div>
<div class="chart-bar">
<div class="chart-label">IronClaw</div>
<div class="chart-track"><div class="chart-fill" style="width:0.5%;background:var(--accent2)"></div></div>
<div class="chart-value">7.8 MB</div>
</div>
<div class="chart-bar">
<div class="chart-label">ZeroClaw</div>
<div class="chart-track"><div class="chart-fill" style="width:0.3%;background:var(--accent2)"></div></div>
<div class="chart-value">&lt;5 MB</div>
</div>
</div>

<h3>Startup Time</h3>
<div class="card">
<div class="chart-bar">
<div class="chart-label">OpenClaw</div>
<div class="chart-track"><div class="chart-fill" style="width:100%;background:var(--danger)"></div></div>
<div class="chart-value">6,000 ms</div>
</div>
<div class="chart-bar">
<div class="chart-label">NanoClaw</div>
<div class="chart-track"><div class="chart-fill" style="width:50%;background:var(--accent3)"></div></div>
<div class="chart-value">3,000 ms</div>
</div>
<div class="chart-bar">
<div class="chart-label">Nanobot</div>
<div class="chart-track"><div class="chart-fill" style="width:13%;background:var(--accent)"></div></div>
<div class="chart-value">800 ms</div>
</div>
<div class="chart-bar">
<div class="chart-label">PicoClaw</div>
<div class="chart-track"><div class="chart-fill" style="width:1.7%;background:var(--accent2)"></div></div>
<div class="chart-value">~100 ms</div>
</div>
<div class="chart-bar">
<div class="chart-label">IronClaw</div>
<div class="chart-track"><div class="chart-fill" style="width:0.2%;background:var(--accent2)"></div></div>
<div class="chart-value">&lt;10 ms</div>
</div>
<div class="chart-bar">
<div class="chart-label">ZeroClaw</div>
<div class="chart-track"><div class="chart-fill" style="width:0.2%;background:var(--accent2)"></div></div>
<div class="chart-value">&lt;10 ms</div>
</div>
</div>

<div class="rec">
<h4>💡 Performance Insight</h4>
<p>The Rust claws (IronClaw, ZeroClaw) are <strong>300x faster to start</strong> and use <strong>200-300x less memory</strong> than OpenClaw. However, OpenClaw's overhead is amortized when running a shared gateway serving thousands of agents — you pay the 1.5GB once, not per agent.</p>
<p>For Clawdet's multi-tenant model, OpenClaw's shared-nothing gateway architecture is actually <strong>more efficient per-agent</strong> than running separate IronClaw instances at scale.</p>
</div>
</div>
</section>

<!-- SECURITY COMPARISON -->
<section id="security-comparison">
<div class="container">
<h2>🛡️ Security Comparison</h2>
<div style="overflow-x:auto">
<table>
<thead>
<tr>
<th>Security Layer</th>
<th>OpenClaw</th>
<th>NanoClaw</th>
<th>Nanobot</th>
<th>IronClaw</th>
<th>PicoClaw</th>
<th>ZeroClaw</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Transport</strong></td>
<td>TLS (configurable)</td>
<td>TLS (WhatsApp)</td>
<td>TLS</td>
<td style="color:var(--accent2)"><strong>TLS 1.3 enforced</strong></td>
<td>TLS</td>
<td>TLS</td>
</tr>
<tr>
<td><strong>Request Filtering</strong></td>
<td>Basic</td>
<td>N/A (single user)</td>
<td>AgentLoop cap (20)</td>
<td style="color:var(--accent2)"><strong>Dedicated filter layer</strong></td>
<td>⚠️ Incomplete</td>
<td>Trait-based</td>
</tr>
<tr>
<td><strong>Credential Storage</strong></td>
<td>Encrypted config</td>
<td>Per-container</td>
<td>Env vars</td>
<td style="color:var(--accent2)"><strong>AES-256-GCM</strong></td>
<td>Config files</td>
<td>SQLite encrypted</td>
</tr>
<tr>
<td><strong>Skill Sandboxing</strong></td>
<td>Process-level</td>
<td style="color:var(--accent2)"><strong>Container boundary</strong></td>
<td>MCP server</td>
<td style="color:var(--accent2)"><strong>WASM sandbox</strong></td>
<td>None</td>
<td>Trait isolation</td>
</tr>
<tr>
<td><strong>Runtime Isolation</strong></td>
<td>Workspace dirs</td>
<td style="color:var(--accent2)"><strong>OS containers</strong></td>
<td>Process</td>
<td style="color:var(--accent2)"><strong>Docker isolation</strong></td>
<td>Process</td>
<td>Process</td>
</tr>
<tr>
<td><strong>Overall Rating</strong></td>
<td><span class="badge badge-orange">Medium</span></td>
<td><span class="badge badge-green">High</span></td>
<td><span class="badge badge-orange">Medium</span></td>
<td><span class="badge badge-green">Highest</span></td>
<td><span class="badge badge-red">Low ⚠️</span></td>
<td><span class="badge badge-orange">Medium</span></td>
</tr>
</tbody>
</table>
</div>

<div class="warn">
<h4>⚠️ Karpathy's OpenClaw Critique</h4>
<p>"A 400K-line vibe-coded monster" with security concerns at the application boundary. Clawdet mitigates this with <strong>K3s namespace isolation + Cilium network policies</strong> layered on top of OpenClaw's application-level security.</p>
</div>
</div>
</section>

<!-- FEATURE MATRIX -->
<section id="features">
<div class="container">
<h2>📊 Feature Matrix</h2>
<div style="overflow-x:auto">
<table>
<thead>
<tr>
<th>Feature</th>
<th>OpenClaw</th>
<th>NanoClaw</th>
<th>Nanobot</th>
<th>IronClaw</th>
<th>PicoClaw</th>
<th>ZeroClaw</th>
</tr>
</thead>
<tbody>
<tr><td>WhatsApp</td><td class="feature-check">✅</td><td class="feature-check">✅</td><td class="feature-check">✅</td><td class="feature-check">✅</td><td class="feature-x">❌</td><td class="feature-check">✅</td></tr>
<tr><td>Telegram</td><td class="feature-check">✅</td><td class="feature-x">❌</td><td class="feature-check">✅</td><td class="feature-check">✅</td><td class="feature-check">✅</td><td class="feature-check">✅</td></tr>
<tr><td>Discord</td><td class="feature-check">✅</td><td class="feature-x">❌</td><td class="feature-check">✅</td><td class="feature-check">✅</td><td class="feature-check">✅</td><td class="feature-check">✅</td></tr>
<tr><td>Slack</td><td class="feature-check">✅</td><td class="feature-x">❌</td><td class="feature-check">✅</td><td class="feature-partial">🟡</td><td class="feature-x">❌</td><td class="feature-check">✅</td></tr>
<tr><td>WeChat</td><td class="feature-check">✅</td><td class="feature-x">❌</td><td class="feature-partial">🟡</td><td class="feature-x">❌</td><td class="feature-check">✅</td><td class="feature-partial">🟡</td></tr>
<tr><td>Skill Marketplace</td><td class="feature-check">✅ (5,700+)</td><td class="feature-x">❌</td><td class="feature-partial">🟡 MCP</td><td class="feature-partial">🟡 WASM</td><td class="feature-x">❌</td><td class="feature-x">❌</td></tr>
<tr><td>Multi-model</td><td class="feature-check">✅ (20+)</td><td class="feature-x">❌ (Claude only)</td><td class="feature-check">✅ (12+)</td><td class="feature-check">✅ (10+)</td><td class="feature-check">✅</td><td class="feature-check">✅ (22+)</td></tr>
<tr><td>Memory/RAG</td><td class="feature-check">✅</td><td class="feature-partial">🟡 Basic</td><td class="feature-check">✅ MCP</td><td class="feature-check">✅ pgvector</td><td class="feature-partial">🟡</td><td class="feature-check">✅ SQLite</td></tr>
<tr><td>Voice/Multimodal</td><td class="feature-partial">🟡</td><td class="feature-x">❌</td><td class="feature-partial">🟡</td><td class="feature-partial">🟡</td><td class="feature-x">❌</td><td class="feature-partial">🟡</td></tr>
<tr><td>Multi-agent</td><td class="feature-partial">🟡</td><td class="feature-x">❌</td><td class="feature-partial">🟡</td><td class="feature-partial">🟡</td><td class="feature-x">❌</td><td class="feature-partial">🟡</td></tr>
<tr><td>Offline/Local-first</td><td class="feature-x">❌</td><td class="feature-x">❌</td><td class="feature-x">❌</td><td class="feature-partial">🟡</td><td class="feature-partial">🟡</td><td class="feature-partial">🟡</td></tr>
<tr><td>Production Ready</td><td class="feature-check">✅</td><td class="feature-check">✅</td><td class="feature-check">✅</td><td class="feature-check">✅</td><td class="feature-x">❌ Pre-v1.0</td><td class="feature-check">✅</td></tr>
</tbody>
</table>
</div>
</div>
</section>

<!-- OUR POSITION -->
<section id="our-position">
<div class="container">
<h2>🎯 Why We Chose OpenClaw</h2>

<div class="rec">
<h4>Clawdet's Stack: OpenClaw + Hetzner + K3s</h4>
<p>Despite valid criticisms of OpenClaw's size and security model, it remains the <strong>only claw with the ecosystem breadth needed for a B2C SaaS product</strong>:</p>
<ul>
<li><strong>11+ platforms</strong> — Customers use WhatsApp, Telegram, Discord, Slack, and more. No other claw covers all.</li>
<li><strong>5,700+ skills</strong> — Instant access to capabilities without building from scratch.</li>
<li><strong>200K+ community</strong> — Issues get fixed fast. Contributions flow. The project won't die.</li>
</ul>
</div>

<h3>How Clawdet Compensates for OpenClaw Weaknesses</h3>
<div class="card-grid">
<div class="card">
<h4>🔒 Security Hardening</h4>
<ul>
<li>K3s namespace isolation per tenant</li>
<li>Cilium eBPF network policies</li>
<li>Rootless containers (Podman)</li>
<li>Falco runtime monitoring</li>
</ul>
<p style="color:var(--text-muted);margin-top:8px">Compensates for OpenClaw's application-level security gap.</p>
</div>
<div class="card">
<h4>💰 Cost Efficiency</h4>
<ul>
<li>Hot/cold agent architecture</li>
<li>Hetzner (5-10x cheaper than AWS)</li>
<li>KEDA auto-scaling to zero</li>
<li>Shared gateway amortizes 1.5GB overhead</li>
</ul>
<p style="color:var(--text-muted);margin-top:8px">Turns OpenClaw's memory overhead into a shared cost across thousands of agents.</p>
</div>
<div class="card">
<h4>🔧 Maintainability</h4>
<ul>
<li>Upstream contributions for critical fixes</li>
<li>Security patch layer maintained separately</li>
<li>Custom provisioner abstracts OpenClaw internals</li>
<li>Migration path to leaner claw if needed</li>
</ul>
<p style="color:var(--text-muted);margin-top:8px">We use OpenClaw as a platform, not as tightly-coupled code.</p>
</div>
</div>
</div>
</section>

<!-- RECOMMENDATIONS -->
<section id="recommendations">
<div class="container">
<h2>📋 Recommendations by Use Case</h2>

<div class="card-grid">
<div class="card" style="border-left:3px solid var(--accent2)">
<h4>🏢 Production SaaS (like Clawdet)</h4>
<p><strong>→ OpenClaw</strong></p>
<p>Ecosystem breadth, platform support, and skill marketplace are unmatched. Layer security on top with K3s + Cilium.</p>
</div>
<div class="card" style="border-left:3px solid var(--accent)">
<h4>🔒 Personal Secure Assistant</h4>
<p><strong>→ NanoClaw</strong></p>
<p>500 lines you can read in an hour. OS-level isolation. Perfect for personal use where WhatsApp + Claude is sufficient.</p>
</div>
<div class="card" style="border-left:3px solid var(--purple)">
<h4>🔬 Developer / Researcher</h4>
<p><strong>→ Nanobot</strong></p>
<p>Clean Python codebase, MCP-native architecture, easy to extend and experiment with.</p>
</div>
<div class="card" style="border-left:3px solid var(--danger)">
<h4>🏦 Enterprise / Regulated</h4>
<p><strong>→ IronClaw</strong></p>
<p>5-layer security, WASM sandboxing, 7.8MB footprint. Built for environments where security is non-negotiable.</p>
</div>
<div class="card" style="border-left:3px solid var(--accent3)">
<h4>📟 IoT / Edge Computing</h4>
<p><strong>→ PicoClaw</strong> (when v1.0 ships)</p>
<p>&lt;10MB RAM, runs on $10 hardware. Wait for security issues to be resolved before production use.</p>
</div>
<div class="card" style="border-left:3px solid var(--text-muted)">
<h4>🔄 Vendor-Neutral Teams</h4>
<p><strong>→ ZeroClaw</strong></p>
<p>22+ LLM providers, swap any component. Ideal for teams that refuse vendor lock-in.</p>
</div>
</div>

<div class="rec" style="margin-top:24px">
<h4>🏆 The Clawdet Verdict</h4>
<p><strong>OpenClaw for now, eyes on IronClaw for enterprise tier.</strong></p>
<p>OpenClaw's ecosystem wins for our B2C SaaS model. When we launch an enterprise tier for regulated industries, IronClaw's security model may be worth the platform trade-off. The trait architecture of ZeroClaw is also worth watching for future portability.</p>
</div>
</div>
</section>

</main>`;

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
          <Link href="/tech/scaling" style={{ color: '#8b949e', fontSize: '.875rem', padding: '6px 12px', borderRadius: 6, textDecoration: 'none' }}>📊 Scaling</Link>
          <Link href="/tech/security" style={{ color: '#8b949e', fontSize: '.875rem', padding: '6px 12px', borderRadius: 6, textDecoration: 'none' }}>🛡️ Security</Link>
          <Link href="/tech/models" style={{ color: '#2EE68A', fontSize: '.875rem', padding: '6px 12px', borderRadius: 6, textDecoration: 'none' }}>🐾 Models</Link>
          <Link href="/tech/strategy" style={{ color: '#8b949e', fontSize: '.875rem', padding: '6px 12px', borderRadius: 6, textDecoration: 'none' }}>🎯 Strategy</Link>
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
