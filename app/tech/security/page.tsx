'use client';
import Link from 'next/link';

export default function SecurityPage() {
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
.cost{font-weight:700;font-size:1.1rem}
.cost-low{color:var(--accent2)}
.cost-mid{color:var(--accent3)}
.cost-high{color:var(--danger)}
.rec{background:linear-gradient(135deg,rgba(63,185,80,.15),rgba(63,185,80,.05));border:1px solid rgba(63,185,80,.3);border-radius:12px;padding:20px 24px;margin:16px 0}
.rec h4{color:var(--accent2);margin-top:0}
.warn{background:linear-gradient(135deg,rgba(240,136,62,.15),rgba(240,136,62,.05));border:1px solid rgba(240,136,62,.3);border-radius:12px;padding:20px 24px;margin:16px 0}
.danger-box{background:linear-gradient(135deg,rgba(248,81,73,.15),rgba(248,81,73,.05));border:1px solid rgba(248,81,73,.3);border-radius:12px;padding:20px 24px;margin:16px 0}
.danger-box h4{color:var(--danger);margin-top:0}
ul{margin:8px 0 8px 24px}li{margin:4px 0}
footer{padding:32px 0;text-align:center;color:var(--text-muted);font-size:.85rem}
@media(max-width:768px){
.card-grid{grid-template-columns:1fr}
nav .container{gap:8px}
header h1{font-size:1.6rem}
h2{font-size:1.4rem}
table{font-size:.8rem}
th,td{padding:8px}
.diagram-container svg{width:100%!important}
}







/* Diagram styles */
.diagram-container{overflow-x:auto;margin:16px 0}
.arch-box{fill:var(--surface);stroke:var(--border);stroke-width:1.5;rx:8;cursor:pointer;transition:all .2s}
.arch-box:hover{stroke:var(--accent);stroke-width:2;filter:drop-shadow(0 0 8px rgba(46,230,138,.3))}
.arch-label{fill:var(--text);font-size:13px;font-family:inherit;pointer-events:none}
.arch-sublabel{fill:var(--text-muted);font-size:10px;font-family:inherit;pointer-events:none}
.arch-line{stroke:var(--border);stroke-width:1.5;marker-end:url(#arrowhead)}
.arch-line-accent{stroke:var(--accent);stroke-width:2;stroke-dasharray:6,3}
.security-boundary{fill:none;stroke:var(--danger);stroke-width:2;stroke-dasharray:8,4;rx:12;opacity:.6}
.boundary-label{fill:var(--danger);font-size:11px;font-family:inherit;opacity:.8}

/* Project card styles */
.project-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px;transition:border-color .2s}
.project-card:hover{border-color:var(--accent)}
.project-card h4{margin:0 0 8px;color:var(--text)}
.project-card .meta{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px}
.stars{color:var(--accent3);font-size:.8rem}
.project-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:16px;margin:16px 0}

/* Threat severity */
.severity-critical{color:var(--danger);font-weight:700}
.severity-high{color:var(--accent3);font-weight:600}
.severity-medium{color:#d29922;font-weight:500}
.severity-low{color:var(--accent2)}

/* Isolation meter */
.isolation-meter{display:flex;gap:2px;align-items:center}
.iso-block{width:16px;height:16px;border-radius:3px;background:var(--surface2)}
.iso-block.filled-green{background:var(--accent2)}
.iso-block.filled-orange{background:var(--accent3)}
.iso-block.filled-red{background:var(--danger)}
`;
  
  const bodyContent = `<header>
<div class="container">
<h1>🛡️ OpenClaw Security & Architecture Comparison</h1>
<p>Multi-tenant isolation models, open source evaluation, and threat analysis</p>
<div style="margin-top:12px">
<span class="badge badge-blue">Feb 2026</span>
<span class="badge badge-green">v1.0</span>
<span class="badge badge-purple">Technical Deep Dive</span>
</div>
</div>
</header>



<main>

<!-- ============================================================ -->
<!-- SECTION 1: THREE ARCHITECTURE MODELS -->
<!-- ============================================================ -->
<section id="arch-models">
<div class="container">
<h2>🏗️ Three Architecture Models Compared</h2>
<p style="color:var(--text-muted);margin-bottom:24px">Workspaces (shared process) vs Containers (our current) vs Kubernetes (pods + namespaces)</p>

<div class="card">
<h3>Overview</h3>
<table>
<tr>
<th>Dimension</th>
<th>🟡 Workspaces Model</th>
<th>🟢 Containers Model (Current)</th>
<th>🔵 Kubernetes Model</th>
</tr>
<tr>
<td><strong>Architecture</strong></td>
<td>Single OpenClaw process, multiple tenant configs/workspaces sharing Node.js runtime</td>
<td>One Docker container per tenant, each with own OpenClaw process (~380-550MB)</td>
<td>K8s pods per tenant with namespace isolation, network policies, RBAC, service mesh</td>
</tr>
<tr>
<td><strong>Process Isolation</strong></td>
<td class="severity-critical">❌ None — shared process</td>
<td class="severity-low">✅ Full — separate PID namespace</td>
<td class="severity-low">✅ Full — pod sandbox + optional gVisor/Kata</td>
</tr>
<tr>
<td><strong>Filesystem Isolation</strong></td>
<td class="severity-high">⚠️ Directory-level only</td>
<td class="severity-low">✅ overlay2 filesystem per container</td>
<td class="severity-low">✅ Per-pod volumes + PV isolation</td>
</tr>
<tr>
<td><strong>Network Isolation</strong></td>
<td class="severity-critical">❌ Shared network stack</td>
<td class="severity-medium">⚠️ Docker bridge — needs manual iptables</td>
<td class="severity-low">✅ NetworkPolicy + CNI (Cilium/Calico)</td>
</tr>
<tr>
<td><strong>Secrets Isolation</strong></td>
<td class="severity-critical">❌ All in same process memory</td>
<td class="severity-low">✅ Separate env vars per container</td>
<td class="severity-low">✅ K8s Secrets + Vault per namespace</td>
</tr>
<tr>
<td><strong>Memory per Tenant (idle)</strong></td>
<td class="cost-low">~15-30 MB (config + workspace state)</td>
<td>~380 MB (full Node.js process + deps)</td>
<td>~400-420 MB (pod overhead + sidecar)</td>
</tr>
<tr>
<td><strong>Memory per Tenant (active)</strong></td>
<td class="cost-low">~50-100 MB</td>
<td>~550 MB</td>
<td>~580 MB (with sidecar proxy)</td>
</tr>
<tr>
<td><strong>CPU Overhead per Tenant</strong></td>
<td class="cost-low">~0.01 vCPU idle</td>
<td>~0.05 vCPU idle</td>
<td>~0.06 vCPU idle (kubelet overhead)</td>
</tr>
<tr>
<td><strong>Cold Start Time</strong></td>
<td class="cost-low">&lt;100ms (load config)</td>
<td>2-5s (start container)</td>
<td>3-8s (schedule + pull + start)</td>
</tr>
<tr class="highlight-row">
<td><strong>Blast Radius</strong></td>
<td class="severity-critical">🔴 TOTAL — all tenants compromised</td>
<td class="severity-medium">🟡 Single container — host if escape</td>
<td class="severity-low">🟢 Single pod — namespace at worst</td>
</tr>
<tr>
<td><strong>Can Tenant A Read B's Keys?</strong></td>
<td class="severity-critical">Yes — same memory space</td>
<td class="severity-low">No — separate process/env</td>
<td class="severity-low">No — RBAC + namespace separation</td>
</tr>
<tr>
<td><strong>Can Tenant A Reach B's Network?</strong></td>
<td class="severity-critical">Yes — shared localhost</td>
<td class="severity-medium">Possible without proper iptables</td>
<td class="severity-low">No — NetworkPolicy denies by default</td>
</tr>
<tr>
<td><strong>Resource Abuse Protection</strong></td>
<td class="severity-critical">❌ One tenant can starve all</td>
<td class="severity-medium">⚠️ cgroups limits (if configured)</td>
<td class="severity-low">✅ ResourceQuota + LimitRange enforced</td>
</tr>
</table>
</div>

<h3>Cost per Tenant at Scale</h3>
<div class="card">
<table>
<tr>
<th>Scale</th>
<th>🟡 Workspaces</th>
<th>🟢 Containers (Hetzner)</th>
<th>🔵 Kubernetes (Hetzner)</th>
</tr>
<tr>
<td><strong>5K tenants</strong></td>
<td class="cost-low">€0.02/tenant/mo (~€100 total, 1 server)</td>
<td>€0.24/tenant/mo (€1,200 total, 8 servers)</td>
<td>€0.28/tenant/mo (€1,400 total, 9 servers + K8s overhead)</td>
</tr>
<tr>
<td><strong>50K tenants</strong></td>
<td class="cost-low">€0.01/tenant/mo (~€500 total, 4 servers)</td>
<td>€0.24/tenant/mo (€12,000 total, 80 servers)</td>
<td>€0.26/tenant/mo (€13,000 total, 85 servers)</td>
</tr>
<tr>
<td><strong>500K tenants</strong></td>
<td class="cost-low">€0.006/tenant/mo (~€3,000 total)</td>
<td class="cost-mid">€0.045/tenant/mo (€22,500 hot/cold)</td>
<td class="cost-mid">€0.05/tenant/mo (€25,000 hot/cold)</td>
</tr>
</table>
</div>

<div class="rec">
<h4>🏆 Architecture Model Verdict</h4>
<p><strong>Workspaces</strong> is 10-20× cheaper but has <strong>zero tenant isolation</strong> — a single vulnerability exposes ALL tenants. Unacceptable for a commercial multi-tenant product.</p>
<p><strong>Containers</strong> (our current model) provides strong isolation at reasonable cost. The sweet spot for 5K-50K.</p>
<p><strong>Kubernetes</strong> adds ~10-15% overhead but provides declarative network policies, RBAC, auto-healing, rolling updates, and the richest ecosystem for security tooling (Cilium, Falco, OPA). The clear winner at 50K+ where operational complexity matters more than per-unit cost.</p>
</div>

<div class="warn">
<h4>⚠️ Hybrid Option: Workspaces for Free Tier + Containers for Paid</h4>
<p>Consider offering a <strong>free/trial tier using workspaces</strong> (low isolation, shared process) and <strong>paid tier using containers/K8s</strong> (full isolation). This gives 10× density for free users who don't need security guarantees, while paid users get proper isolation. Many SaaS companies use this tiered model.</p>
</div>
</div>
</section>

<!-- ============================================================ -->
<!-- SECTION 2: OPEN SOURCE PROJECTS EVALUATION -->
<!-- ============================================================ -->
<section id="open-source">
<div class="container">
<h2>🔍 Open Source Projects Evaluation</h2>
<p style="color:var(--text-muted);margin-bottom:24px">14 projects evaluated for multi-tenant container orchestration at scale</p>

<h3>Container Orchestrators</h3>
<div class="project-grid">

<div class="project-card" style="border-color:var(--accent2)">
<h4>⭐ K3s — Lightweight Kubernetes</h4>
<div class="meta">
<span class="badge badge-green">Recommended</span>
<span class="badge badge-blue">CNCF Sandbox → Graduated</span>
<span class="stars">★ 29K+ GitHub</span>
</div>
<p><strong>What:</strong> Single-binary Kubernetes distribution by Rancher/SUSE. Strips etcd (uses SQLite/embedded), cloud controllers, and optional components. Full K8s API compatible.</p>
<p><strong>Security:</strong> Same K8s RBAC, NetworkPolicy, PodSecurityStandards. Smaller attack surface (fewer components). Supports Cilium, Calico. Embedded containerd.</p>
<p><strong>Overhead:</strong> ~512MB RAM for server node (vs 2-4GB for full K8s). Single binary ~100MB. Agent nodes ~256MB overhead.</p>
<p><strong>Maturity:</strong> Production-ready since 2020. Used by thousands of edge deployments. Rancher/SUSE backed.</p>
<ul>
<li>✅ Perfect for 5K tier — simple, lightweight, full K8s API</li>
<li>✅ Easy HA with embedded etcd mode (3+ servers)</li>
<li>✅ Built-in Traefik ingress, Helm controller</li>
<li>⚠️ May need replacement at 50K+ (etcd scaling limits)</li>
</ul>
</div>

<div class="project-card">
<h4>K0s — Zero-Friction Kubernetes</h4>
<div class="meta">
<span class="badge badge-blue">CNCF Sandbox</span>
<span class="stars">★ 8K+ GitHub</span>
</div>
<p><strong>What:</strong> Single-binary K8s by Mirantis. Similar to K3s but keeps full K8s components. Focus on ease of deployment and lifecycle management.</p>
<p><strong>Security:</strong> Full K8s security model. Supports kube-bench compliance. Control plane isolated in own process group.</p>
<p><strong>Overhead:</strong> ~700MB for controller, slightly heavier than K3s. Full etcd included.</p>
<p><strong>Maturity:</strong> Production since 2021. Mirantis backed. Smaller community than K3s.</p>
<ul>
<li>✅ Clean upgrade path — built-in autopilot for automated updates</li>
<li>✅ Full etcd = better for larger clusters</li>
<li>⚠️ Smaller ecosystem/community than K3s</li>
<li>⚠️ Less battle-tested at large scale</li>
</ul>
</div>

<div class="project-card">
<h4>HashiCorp Nomad</h4>
<div class="meta">
<span class="badge badge-orange">BSL Licensed</span>
<span class="stars">★ 15K+ GitHub</span>
</div>
<p><strong>What:</strong> Workload orchestrator supporting containers, VMs, binaries. Simpler than K8s. Integrates with Consul (service mesh) and Vault (secrets).</p>
<p><strong>Security:</strong> ACL system, namespace isolation, Sentinel policies (Enterprise). No built-in NetworkPolicy equivalent — needs Consul Connect for service mesh.</p>
<p><strong>Overhead:</strong> Very low — ~100MB RAM for agent. No etcd dependency. Scales to millions of allocations.</p>
<p><strong>Maturity:</strong> Production since 2015. Used by Roblox, Cloudflare. <strong>⚠️ BSL license since 2023</strong> — not truly open source.</p>
<ul>
<li>✅ Simpler operational model than K8s</li>
<li>✅ Proven at massive scale (Roblox: 3M+ containers)</li>
<li>❌ BSL license — vendor lock-in risk</li>
<li>❌ Smaller ecosystem, fewer security tools</li>
<li>❌ Enterprise features (namespaces, Sentinel) require paid license</li>
</ul>
</div>

<div class="project-card">
<h4>Docker Swarm</h4>
<div class="meta">
<span class="badge badge-red">Declining</span>
<span class="stars">★ Built into Docker</span>
</div>
<p><strong>What:</strong> Docker's native orchestration. Simple cluster mode built into Docker Engine. Easy to set up.</p>
<p><strong>Security:</strong> Mutual TLS between nodes, encrypted overlay networks, secret management. No fine-grained RBAC or NetworkPolicy.</p>
<p><strong>Overhead:</strong> Minimal — ~50MB for manager. Uses existing Docker daemon.</p>
<p><strong>Maturity:</strong> Stable but <strong>effectively abandoned</strong>. No new features since 2019. Docker Inc focused on Desktop/Hub.</p>
<ul>
<li>✅ Simplest to set up from current Docker setup</li>
<li>✅ Built-in encrypted overlay network</li>
<li>❌ Dead project — no active development</li>
<li>❌ No NetworkPolicy, limited RBAC</li>
<li>❌ No ecosystem (no Helm, no operators, no tooling)</li>
</ul>
</div>

</div>

<h3>Container Runtimes & Sandboxes</h3>
<div class="project-grid">

<div class="project-card" style="border-color:var(--accent2)">
<h4>⭐ gVisor — Application Kernel Sandbox</h4>
<div class="meta">
<span class="badge badge-green">Recommended</span>
<span class="badge badge-blue">Google</span>
<span class="stars">★ 16K+ GitHub</span>
</div>
<p><strong>What:</strong> User-space kernel (Sentry) that intercepts syscalls. Containers run on gVisor instead of host kernel. Used in GKE Sandbox, Cloud Run, App Engine.</p>
<p><strong>Security:</strong> <strong>Strongest software-only isolation.</strong> Intercepts 200+ Linux syscalls. Even if container escapes, attacker hits gVisor, not host kernel. No kernel exploit passthrough.</p>
<p><strong>Overhead:</strong> ~20-50MB extra RAM per sandbox. 5-15% CPU overhead for syscall-heavy workloads. Negligible for I/O-bound apps like OpenClaw (mostly network calls to LLM APIs).</p>
<p><strong>Maturity:</strong> Production at Google scale since 2018. Powers GKE Sandbox, Cloud Run. K8s RuntimeClass integration.</p>
<ul>
<li>✅ Best security/overhead ratio for our use case</li>
<li>✅ OCI-compatible — works with K8s via containerd</li>
<li>✅ Minimal overhead for network-bound workloads (our case)</li>
<li>✅ No hardware requirements (unlike Kata/Firecracker)</li>
<li>⚠️ Some syscalls unsupported — test OpenClaw compatibility</li>
</ul>
</div>

<div class="project-card" style="border-color:var(--accent)">
<h4>⭐ Firecracker — microVMs</h4>
<div class="meta">
<span class="badge badge-green">Recommended (500K)</span>
<span class="badge badge-blue">AWS</span>
<span class="stars">★ 27K+ GitHub</span>
</div>
<p><strong>What:</strong> Lightweight VMM (Virtual Machine Monitor) by AWS. Creates microVMs in ~125ms with ~5MB memory overhead. Powers AWS Lambda and Fargate.</p>
<p><strong>Security:</strong> <strong>Strongest isolation — hardware-level VM boundary.</strong> Each microVM has its own kernel. Jailer process applies seccomp + cgroups + chroot. Minimal device model (reduces attack surface).</p>
<p><strong>Overhead:</strong> ~5MB VMM overhead + ~30MB for minimal Linux kernel. Total ~35MB extra vs container. Boot in ~125ms.</p>
<p><strong>Maturity:</strong> Powers ALL of AWS Lambda/Fargate. Battle-tested at extreme scale. Apache 2.0 license.</p>
<ul>
<li>✅ VM-level isolation with container-like speed</li>
<li>✅ Proven at AWS scale (millions of instances)</li>
<li>✅ Minimal overhead — lighter than full VMs</li>
<li>⚠️ Requires KVM (bare metal or nested virt) — works on Hetzner dedicated ✅</li>
<li>⚠️ More complex orchestration — no native K8s integration (use Kata as bridge)</li>
</ul>
</div>

<div class="project-card">
<h4>Kata Containers — VM-Isolated Containers</h4>
<div class="meta">
<span class="badge badge-blue">CNCF / OpenInfra</span>
<span class="stars">★ 5K+ GitHub</span>
</div>
<p><strong>What:</strong> OCI-compatible runtime that runs containers inside lightweight VMs. Uses QEMU or Cloud Hypervisor. Compatible with K8s via RuntimeClass.</p>
<p><strong>Security:</strong> VM-level isolation. Each pod gets its own kernel. Supports Firecracker as VMM backend. Hardware-enforced boundary.</p>
<p><strong>Overhead:</strong> ~40-128MB per VM (depending on VMM). Boot: 500ms-2s. Higher than gVisor but stronger isolation.</p>
<p><strong>Maturity:</strong> Production since 2018. Used by Azure (ACI), Ant Group, Baidu. Kata 3.x is current generation.</p>
<ul>
<li>✅ K8s-native via RuntimeClass — easy integration</li>
<li>✅ Can use Firecracker backend for lower overhead</li>
<li>✅ Strongest K8s-compatible isolation</li>
<li>⚠️ Higher memory overhead than gVisor</li>
<li>⚠️ Requires KVM support</li>
</ul>
</div>

<div class="project-card">
<h4>Sysbox — Nested Containers</h4>
<div class="meta">
<span class="badge badge-blue">Nestybox/Docker</span>
<span class="stars">★ 3K+ GitHub</span>
</div>
<p><strong>What:</strong> OCI runtime that creates "VM-like" containers — can run Docker, K8s, systemd inside. Enhanced isolation without VMs.</p>
<p><strong>Security:</strong> Uses Linux user namespaces for rootless. Automatic UID shifting. Better than standard runc but weaker than gVisor/Kata.</p>
<p><strong>Overhead:</strong> ~10MB extra per container. No virtualization required.</p>
<p><strong>Maturity:</strong> Acquired by Docker Inc in 2022. Integrated into Docker Desktop. Less active standalone development.</p>
<ul>
<li>✅ Good for "Docker-in-Docker" use cases</li>
<li>⚠️ Not ideal for our use case (we don't need nested containers)</li>
<li>⚠️ Unclear long-term standalone future after Docker acquisition</li>
</ul>
</div>

<div class="project-card">
<h4>Podman + systemd — Rootless Containers</h4>
<div class="meta">
<span class="badge badge-blue">Red Hat</span>
<span class="stars">★ 24K+ GitHub</span>
</div>
<p><strong>What:</strong> Daemonless container engine. Each container runs as its own process under systemd. Rootless by default — no root daemon.</p>
<p><strong>Security:</strong> <strong>No root daemon = smaller attack surface.</strong> User namespaces, rootless networking. SELinux integration. Each container isolated under separate UID.</p>
<p><strong>Overhead:</strong> Same as Docker containers (no additional overhead). Slightly better due to no daemon.</p>
<p><strong>Maturity:</strong> RHEL default since RHEL 8. Production-ready. Full Docker CLI compatibility via podman-docker.</p>
<ul>
<li>✅ Drop-in Docker replacement with better security defaults</li>
<li>✅ systemd integration = native service management</li>
<li>⚠️ No orchestration built-in (need K8s/Nomad on top)</li>
<li>⚠️ Podman pods are basic — not a K8s replacement</li>
</ul>
</div>

<div class="project-card">
<h4>Incus (LXC/LXD) — System Containers</h4>
<div class="meta">
<span class="badge badge-blue">Linux Containers</span>
<span class="stars">★ 3K+ GitHub</span>
</div>
<p><strong>What:</strong> System container manager (forked from Canonical's LXD). Runs full Linux distros as lightweight containers. Also supports VMs.</p>
<p><strong>Security:</strong> System containers share host kernel (like Docker). Supports AppArmor, seccomp, user namespaces. Network isolation via bridges/OVN.</p>
<p><strong>Overhead:</strong> Minimal (~5-10MB per instance). System containers are lighter than app containers due to shared libs.</p>
<p><strong>Maturity:</strong> LXC/LXD has 10+ years of history. Incus forked in 2023 after Canonical changed LXD license. Active development under Linux Containers project.</p>
<ul>
<li>✅ Very low overhead per instance</li>
<li>✅ Full OS environment per tenant</li>
<li>⚠️ Less tooling ecosystem than K8s/Docker</li>
<li>⚠️ No native CI/CD integration, no Helm equivalent</li>
</ul>
</div>

</div>

<h3>Networking & Security Tools</h3>
<div class="project-grid">

<div class="project-card" style="border-color:var(--accent2)">
<h4>⭐ Cilium — eBPF Networking + Security</h4>
<div class="meta">
<span class="badge badge-green">Recommended</span>
<span class="badge badge-blue">CNCF Graduated</span>
<span class="stars">★ 21K+ GitHub</span>
</div>
<p><strong>What:</strong> Kubernetes CNI plugin using eBPF for networking, observability, and security. Replaces kube-proxy and iptables. Provides L3-L7 network policies.</p>
<p><strong>Security:</strong> <strong>Best-in-class network security.</strong> L7-aware policies (HTTP, gRPC, DNS). Transparent encryption (WireGuard or IPsec). Identity-based policies (not just IP). Hubble for network observability.</p>
<p><strong>Overhead:</strong> ~100-200MB per node for Cilium agent. eBPF programs are kernel-native — near-zero per-packet overhead.</p>
<p><strong>Maturity:</strong> CNCF graduated. Used by Google (GKE dataplane v2), AWS, Azure, Datadog, Adobe. Isovalent (now Cisco) backed.</p>
<ul>
<li>✅ Essential for multi-tenant K8s — L7 network policies</li>
<li>✅ Built-in WireGuard encryption between nodes</li>
<li>✅ Hubble UI for network flow visibility</li>
<li>✅ Replaces kube-proxy (better performance)</li>
<li>✅ Transparent mTLS without sidecar</li>
</ul>
</div>

<div class="project-card" style="border-color:var(--accent2)">
<h4>⭐ Falco — Runtime Security</h4>
<div class="meta">
<span class="badge badge-green">Recommended</span>
<span class="badge badge-blue">CNCF Graduated</span>
<span class="stars">★ 7.5K+ GitHub</span>
</div>
<p><strong>What:</strong> Runtime security monitoring using eBPF/kernel modules. Detects anomalous behavior: unexpected shell access, file reads, network connections, privilege escalation.</p>
<p><strong>Security:</strong> <strong>Detective control</strong> — catches attacks in progress. Rules engine for syscall patterns. Integrates with alerting (Slack, PagerDuty, SIEM). Detects container escapes, cryptominers, reverse shells.</p>
<p><strong>Overhead:</strong> ~50-100MB per node. eBPF driver is lightweight. Minimal CPU impact.</p>
<p><strong>Maturity:</strong> CNCF graduated (2024). Sysdig backed. Used by major enterprises. Large rule library.</p>
<ul>
<li>✅ Detects tenant escape attempts in real-time</li>
<li>✅ Pre-built rules for common attacks</li>
<li>✅ Low overhead via eBPF</li>
<li>✅ Pairs with Cilium for detect + prevent</li>
</ul>
</div>

<div class="project-card" style="border-color:var(--accent2)">
<h4>⭐ KEDA — Event-Driven Autoscaling</h4>
<div class="meta">
<span class="badge badge-green">Recommended</span>
<span class="badge badge-blue">CNCF Graduated</span>
<span class="stars">★ 8.5K+ GitHub</span>
</div>
<p><strong>What:</strong> Kubernetes event-driven autoscaler. Scales deployments from 0 to N based on event sources (HTTP, queue depth, cron, custom metrics). Enables scale-to-zero.</p>
<p><strong>Security:</strong> N/A (scaling component). Integrates with K8s RBAC. TriggerAuthentication for secure credential handling.</p>
<p><strong>Overhead:</strong> ~50MB for KEDA operator. Per-scaler overhead negligible.</p>
<p><strong>Maturity:</strong> CNCF graduated. Microsoft-originated. 60+ built-in scalers. Production at major enterprises.</p>
<ul>
<li>✅ Critical for hot/cold architecture — scale idle pods to zero</li>
<li>✅ HTTP scaler for on-demand container wake</li>
<li>✅ 60+ event sources (webhooks, queues, cron)</li>
<li>✅ Native K8s HPA integration</li>
</ul>
</div>

<div class="project-card">
<h4>Virtual Kubelet — Serverless K8s Nodes</h4>
<div class="meta">
<span class="badge badge-blue">CNCF Sandbox</span>
<span class="stars">★ 4.5K+ GitHub</span>
</div>
<p><strong>What:</strong> Masquerades as a kubelet, allowing K8s to schedule pods on external platforms (ACI, Fargate, Nomad). Enables "burst to cloud" from on-prem K8s.</p>
<p><strong>Security:</strong> Depends on backend. ACI/Fargate provide good isolation. Network bridging between on-prem and cloud needs careful setup.</p>
<p><strong>Overhead:</strong> ~30MB for Virtual Kubelet process. Backend-dependent costs.</p>
<p><strong>Maturity:</strong> CNCF sandbox. Used by Azure (AKS virtual nodes). Less active community.</p>
<ul>
<li>✅ Enables hybrid Hetzner + Cloud burst architecture</li>
<li>✅ Pods see it as just another node</li>
<li>⚠️ Networking between real and virtual nodes is complex</li>
<li>⚠️ Limited to specific cloud backends</li>
</ul>
</div>

</div>

<h3>Master Comparison Table</h3>
<div class="card" style="overflow-x:auto">
<table>
<tr>
<th>Project</th>
<th>Category</th>
<th>Security Level</th>
<th>Overhead</th>
<th>Maturity</th>
<th>Our Use Case Fit</th>
</tr>
<tr class="highlight-row">
<td><strong>K3s</strong></td>
<td>Orchestrator</td>
<td><span class="badge badge-green">High</span></td>
<td><span class="badge badge-green">Low</span></td>
<td><span class="badge badge-green">Production</span></td>
<td>⭐⭐⭐⭐⭐ Perfect for 5K tier</td>
</tr>
<tr>
<td><strong>K0s</strong></td>
<td>Orchestrator</td>
<td><span class="badge badge-green">High</span></td>
<td><span class="badge badge-green">Low</span></td>
<td><span class="badge badge-green">Production</span></td>
<td>⭐⭐⭐⭐ Good alternative to K3s</td>
</tr>
<tr>
<td><strong>Nomad</strong></td>
<td>Orchestrator</td>
<td><span class="badge badge-orange">Medium</span></td>
<td><span class="badge badge-green">Very Low</span></td>
<td><span class="badge badge-green">Production</span></td>
<td>⭐⭐⭐ Good but BSL license concern</td>
</tr>
<tr>
<td><strong>Docker Swarm</strong></td>
<td>Orchestrator</td>
<td><span class="badge badge-orange">Medium</span></td>
<td><span class="badge badge-green">Minimal</span></td>
<td><span class="badge badge-red">Abandoned</span></td>
<td>⭐ Avoid — dead project</td>
</tr>
<tr class="highlight-row">
<td><strong>gVisor</strong></td>
<td>Runtime Sandbox</td>
<td><span class="badge badge-green">Very High</span></td>
<td><span class="badge badge-green">Low</span></td>
<td><span class="badge badge-green">Production</span></td>
<td>⭐⭐⭐⭐⭐ Best security/overhead ratio</td>
</tr>
<tr class="highlight-row">
<td><strong>Firecracker</strong></td>
<td>microVM</td>
<td><span class="badge badge-green">Highest</span></td>
<td><span class="badge badge-green">Low</span></td>
<td><span class="badge badge-green">Production</span></td>
<td>⭐⭐⭐⭐ Great for 500K (via Kata)</td>
</tr>
<tr>
<td><strong>Kata Containers</strong></td>
<td>VM Runtime</td>
<td><span class="badge badge-green">Highest</span></td>
<td><span class="badge badge-orange">Medium</span></td>
<td><span class="badge badge-green">Production</span></td>
<td>⭐⭐⭐⭐ K8s bridge to Firecracker</td>
</tr>
<tr>
<td><strong>Sysbox</strong></td>
<td>Container Runtime</td>
<td><span class="badge badge-orange">Medium-High</span></td>
<td><span class="badge badge-green">Low</span></td>
<td><span class="badge badge-orange">Maturing</span></td>
<td>⭐⭐ Not our use case</td>
</tr>
<tr>
<td><strong>Podman</strong></td>
<td>Container Engine</td>
<td><span class="badge badge-green">High</span></td>
<td><span class="badge badge-green">Low</span></td>
<td><span class="badge badge-green">Production</span></td>
<td>⭐⭐⭐ Good runtime, needs orchestrator</td>
</tr>
<tr>
<td><strong>Incus (LXD)</strong></td>
<td>System Containers</td>
<td><span class="badge badge-orange">Medium</span></td>
<td><span class="badge badge-green">Very Low</span></td>
<td><span class="badge badge-green">Production</span></td>
<td>⭐⭐⭐ Interesting for density</td>
</tr>
<tr class="highlight-row">
<td><strong>Cilium</strong></td>
<td>Networking/Security</td>
<td><span class="badge badge-green">Highest</span></td>
<td><span class="badge badge-green">Low</span></td>
<td><span class="badge badge-green">Production</span></td>
<td>⭐⭐⭐⭐⭐ Must-have for multi-tenant</td>
</tr>
<tr class="highlight-row">
<td><strong>Falco</strong></td>
<td>Runtime Security</td>
<td><span class="badge badge-green">High</span></td>
<td><span class="badge badge-green">Low</span></td>
<td><span class="badge badge-green">Production</span></td>
<td>⭐⭐⭐⭐⭐ Must-have for detection</td>
</tr>
<tr class="highlight-row">
<td><strong>KEDA</strong></td>
<td>Autoscaling</td>
<td>N/A</td>
<td><span class="badge badge-green">Minimal</span></td>
<td><span class="badge badge-green">Production</span></td>
<td>⭐⭐⭐⭐⭐ Essential for hot/cold</td>
</tr>
<tr>
<td><strong>Virtual Kubelet</strong></td>
<td>Hybrid Cloud</td>
<td><span class="badge badge-orange">Varies</span></td>
<td><span class="badge badge-green">Minimal</span></td>
<td><span class="badge badge-orange">Maturing</span></td>
<td>⭐⭐⭐ Useful for cloud burst</td>
</tr>
</table>
</div>

</div>
</section>

<!-- ============================================================ -->
<!-- SECTION 3: ARCHITECTURE DIAGRAMS -->
<!-- ============================================================ -->
<section id="diagrams">
<div class="container">
<h2>📊 Architecture Diagrams</h2>

<h3>Current Architecture (60 Agents)</h3>
<div class="card diagram-container">
<svg viewBox="0 0 900 420" width="900" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit">
<defs>
<marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#8b949e"/></marker>
<marker id="arrowblue" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#2EE68A"/></marker>
</defs>

<!-- Internet -->
<rect x="370" y="10" width="160" height="40" class="arch-box" style="fill:#1c2333"/>
<text x="450" y="35" text-anchor="middle" class="arch-label">🌐 Internet / Users</text>

<!-- WireGuard VPN -->
<rect x="350" y="80" width="200" height="36" class="arch-box" style="stroke:var(--accent2)"/>
<text x="450" y="103" text-anchor="middle" class="arch-label" style="fill:var(--accent2)">🔒 WireGuard VPN</text>

<line x1="450" y1="50" x2="450" y2="80" class="arch-line"/>

<!-- nginx -->
<rect x="360" y="145" width="180" height="36" class="arch-box" style="stroke:var(--accent)"/>
<text x="450" y="168" text-anchor="middle" class="arch-label" style="fill:var(--accent)">nginx (tenant routing)</text>

<line x1="450" y1="116" x2="450" y2="145" class="arch-line"/>

<!-- Provisioner -->
<rect x="680" y="145" width="180" height="36" class="arch-box" style="stroke:var(--purple)"/>
<text x="770" y="168" text-anchor="middle" class="arch-label" style="fill:var(--purple)">Custom Provisioner</text>

<line x1="540" y1="163" x2="680" y2="163" class="arch-line-accent" style="stroke:var(--purple)"/>

<!-- 3 Servers -->
<rect x="20" y="220" width="270" height="180" rx="12" style="fill:none;stroke:var(--accent3);stroke-width:2"/>
<text x="155" y="244" text-anchor="middle" class="arch-label" style="fill:var(--accent3)">Server 1 — AX42 (32GB)</text>

<rect x="315" y="220" width="270" height="180" rx="12" style="fill:none;stroke:var(--accent3);stroke-width:2"/>
<text x="450" y="244" text-anchor="middle" class="arch-label" style="fill:var(--accent3)">Server 2 — AX42 (32GB)</text>

<rect x="610" y="220" width="270" height="180" rx="12" style="fill:none;stroke:var(--accent3);stroke-width:2"/>
<text x="745" y="244" text-anchor="middle" class="arch-label" style="fill:var(--accent3)">Server 3 — AX42 (32GB)</text>

<!-- Containers in each server -->
<rect x="35" y="260" width="115" height="30" class="arch-box"/><text x="92" y="280" text-anchor="middle" class="arch-sublabel">🐾 Agent 1</text>
<rect x="160" y="260" width="115" height="30" class="arch-box"/><text x="217" y="280" text-anchor="middle" class="arch-sublabel">🐾 Agent 2</text>
<rect x="35" y="300" width="115" height="30" class="arch-box"/><text x="92" y="320" text-anchor="middle" class="arch-sublabel">🐾 Agent 3</text>
<rect x="160" y="300" width="115" height="30" class="arch-box"/><text x="217" y="320" text-anchor="middle" class="arch-sublabel">🐾 ...</text>
<text x="155" y="365" text-anchor="middle" class="arch-sublabel">~20 containers each</text>

<rect x="330" y="260" width="115" height="30" class="arch-box"/><text x="387" y="280" text-anchor="middle" class="arch-sublabel">🐾 Agent 21</text>
<rect x="455" y="260" width="115" height="30" class="arch-box"/><text x="512" y="280" text-anchor="middle" class="arch-sublabel">🐾 Agent 22</text>
<rect x="330" y="300" width="115" height="30" class="arch-box"/><text x="387" y="320" text-anchor="middle" class="arch-sublabel">🐾 Agent 23</text>
<rect x="455" y="300" width="115" height="30" class="arch-box"/><text x="512" y="320" text-anchor="middle" class="arch-sublabel">🐾 ...</text>
<text x="450" y="365" text-anchor="middle" class="arch-sublabel">~20 containers each</text>

<rect x="625" y="260" width="115" height="30" class="arch-box"/><text x="682" y="280" text-anchor="middle" class="arch-sublabel">🐾 Agent 41</text>
<rect x="750" y="260" width="115" height="30" class="arch-box"/><text x="807" y="280" text-anchor="middle" class="arch-sublabel">🐾 Agent 42</text>
<rect x="625" y="300" width="115" height="30" class="arch-box"/><text x="682" y="320" text-anchor="middle" class="arch-sublabel">🐾 Agent 43</text>
<rect x="750" y="300" width="115" height="30" class="arch-box"/><text x="807" y="320" text-anchor="middle" class="arch-sublabel">🐾 ...</text>
<text x="745" y="365" text-anchor="middle" class="arch-sublabel">~20 containers each</text>

<!-- Lines from nginx to servers -->
<line x1="420" y1="181" x2="155" y2="220" class="arch-line"/>
<line x1="450" y1="181" x2="450" y2="220" class="arch-line"/>
<line x1="480" y1="181" x2="745" y2="220" class="arch-line"/>

<!-- Security boundary label -->
<rect x="10" y="210" width="878" height="200" class="security-boundary"/>
<text x="20" y="415" class="boundary-label">⚠️ Security boundary: Docker containers share host kernel — no NetworkPolicy, manual iptables only</text>
</svg>
</div>

<h3>Proposed K3s Architecture (5K Tier)</h3>
<div class="card diagram-container">
<svg viewBox="0 0 900 480" width="900" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit">
<defs>
<marker id="arrowgreen" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#3fb950"/></marker>
</defs>

<!-- Internet -->
<rect x="370" y="10" width="160" height="40" class="arch-box" style="fill:#1c2333"/>
<text x="450" y="35" text-anchor="middle" class="arch-label">🌐 Internet / Users</text>

<!-- Traefik Ingress -->
<rect x="330" y="75" width="240" height="40" class="arch-box" style="stroke:var(--accent2)"/>
<text x="450" y="100" text-anchor="middle" class="arch-label" style="fill:var(--accent2)">🔀 Traefik Ingress (K3s built-in)</text>

<line x1="450" y1="50" x2="450" y2="75" class="arch-line"/>

<!-- Cilium Network Layer -->
<rect x="100" y="135" width="700" height="30" class="arch-box" style="stroke:var(--accent);fill:rgba(46,230,138,.08)"/>
<text x="450" y="155" text-anchor="middle" class="arch-label" style="fill:var(--accent)">🛡️ Cilium eBPF Network Layer — L7 policies + WireGuard encryption</text>

<line x1="450" y1="115" x2="450" y2="135" class="arch-line"/>

<!-- K3s Control Plane -->
<rect x="30" y="75" width="180" height="40" class="arch-box" style="stroke:var(--purple)"/>
<text x="120" y="100" text-anchor="middle" class="arch-label" style="fill:var(--purple)">K3s Control Plane (HA)</text>

<!-- Namespaces -->
<rect x="30" y="190" width="260" height="140" rx="12" style="fill:none;stroke:var(--accent2);stroke-width:2;stroke-dasharray:6,3"/>
<text x="160" y="210" text-anchor="middle" class="arch-sublabel" style="fill:var(--accent2)">namespace: tenant-001</text>
<rect x="45" y="220" width="105" height="30" class="arch-box"/><text x="97" y="240" text-anchor="middle" class="arch-sublabel">🐾 Pod (Agent)</text>
<rect x="160" y="220" width="115" height="30" class="arch-box"/><text x="217" y="240" text-anchor="middle" class="arch-sublabel">🔐 Secrets</text>
<rect x="45" y="260" width="230" height="24" class="arch-box" style="stroke:var(--accent)"/><text x="160" y="277" text-anchor="middle" class="arch-sublabel" style="fill:var(--accent)">NetworkPolicy: deny-all-ingress</text>
<rect x="45" y="292" width="230" height="24" class="arch-box"/><text x="160" y="309" text-anchor="middle" class="arch-sublabel">ResourceQuota: 600Mi / 0.5 CPU</text>

<rect x="320" y="190" width="260" height="140" rx="12" style="fill:none;stroke:var(--accent2);stroke-width:2;stroke-dasharray:6,3"/>
<text x="450" y="210" text-anchor="middle" class="arch-sublabel" style="fill:var(--accent2)">namespace: tenant-002</text>
<rect x="335" y="220" width="105" height="30" class="arch-box"/><text x="387" y="240" text-anchor="middle" class="arch-sublabel">🐾 Pod (Agent)</text>
<rect x="450" y="220" width="115" height="30" class="arch-box"/><text x="507" y="240" text-anchor="middle" class="arch-sublabel">🔐 Secrets</text>
<rect x="335" y="260" width="230" height="24" class="arch-box" style="stroke:var(--accent)"/><text x="450" y="277" text-anchor="middle" class="arch-sublabel" style="fill:var(--accent)">NetworkPolicy: deny-all-ingress</text>
<rect x="335" y="292" width="230" height="24" class="arch-box"/><text x="450" y="309" text-anchor="middle" class="arch-sublabel">ResourceQuota: 600Mi / 0.5 CPU</text>

<rect x="610" y="190" width="260" height="140" rx="12" style="fill:none;stroke:var(--accent2);stroke-width:2;stroke-dasharray:6,3"/>
<text x="740" y="210" text-anchor="middle" class="arch-sublabel" style="fill:var(--accent2)">namespace: tenant-NNN</text>
<rect x="625" y="220" width="105" height="30" class="arch-box"/><text x="677" y="240" text-anchor="middle" class="arch-sublabel">🐾 Pod (Agent)</text>
<rect x="740" y="220" width="115" height="30" class="arch-box"/><text x="797" y="240" text-anchor="middle" class="arch-sublabel">🔐 Secrets</text>
<rect x="625" y="260" width="230" height="24" class="arch-box" style="stroke:var(--accent)"/><text x="740" y="277" text-anchor="middle" class="arch-sublabel" style="fill:var(--accent)">NetworkPolicy: deny-all-ingress</text>
<rect x="625" y="292" width="230" height="24" class="arch-box"/><text x="740" y="309" text-anchor="middle" class="arch-sublabel">ResourceQuota: 600Mi / 0.5 CPU</text>

<!-- Server layer -->
<rect x="30" y="360" width="840" height="50" class="arch-box" style="stroke:var(--accent3)"/>
<text x="450" y="390" text-anchor="middle" class="arch-label" style="fill:var(--accent3)">8× Hetzner AX162 (128GB RAM, 12 cores, NVMe) — K3s Agent Nodes</text>

<!-- Monitoring -->
<rect x="30" y="430" width="400" height="36" class="arch-box" style="stroke:var(--purple)"/>
<text x="230" y="453" text-anchor="middle" class="arch-label" style="fill:var(--purple)">📊 Prometheus + Grafana (monitoring)</text>

<rect x="460" y="430" width="410" height="36" class="arch-box" style="stroke:var(--danger)"/>
<text x="665" y="453" text-anchor="middle" class="arch-label" style="fill:var(--danger)">🚨 Falco (runtime security detection)</text>

<!-- Connection lines -->
<line x1="160" y1="165" x2="160" y2="190" style="stroke:#3fb950;stroke-width:1.5;marker-end:url(#arrowgreen)"/>
<line x1="450" y1="165" x2="450" y2="190" style="stroke:#3fb950;stroke-width:1.5;marker-end:url(#arrowgreen)"/>
<line x1="740" y1="165" x2="740" y2="190" style="stroke:#3fb950;stroke-width:1.5;marker-end:url(#arrowgreen)"/>

<!-- Security boundary -->
<rect x="20" y="180" width="860" height="160" class="security-boundary" style="stroke:var(--accent2)"/>
<text x="30" y="347" class="boundary-label" style="fill:var(--accent2)">✅ Security: namespace isolation + NetworkPolicy + RBAC + ResourceQuota per tenant</text>
</svg>
</div>

<h3>Proposed K8s Architecture (50K Tier)</h3>
<div class="card diagram-container">
<svg viewBox="0 0 900 500" width="900" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit">

<!-- Internet -->
<rect x="370" y="10" width="160" height="36" class="arch-box" style="fill:#1c2333"/>
<text x="450" y="33" text-anchor="middle" class="arch-label">🌐 Internet</text>

<!-- Load Balancer -->
<rect x="320" y="65" width="260" height="36" class="arch-box" style="stroke:var(--accent2)"/>
<text x="450" y="88" text-anchor="middle" class="arch-label" style="fill:var(--accent2)">🔀 Ingress Controller (Cilium)</text>

<line x1="450" y1="46" x2="450" y2="65" class="arch-line"/>

<!-- Hot/Cold Scheduler -->
<rect x="30" y="65" width="240" height="36" class="arch-box" style="stroke:var(--purple)"/>
<text x="150" y="88" text-anchor="middle" class="arch-label" style="fill:var(--purple)">🧠 Custom Hot/Cold Scheduler</text>

<rect x="630" y="65" width="240" height="36" class="arch-box" style="stroke:var(--accent)"/>
<text x="750" y="88" text-anchor="middle" class="arch-label" style="fill:var(--accent)">⚡ KEDA (scale-to-zero)</text>

<!-- Cilium Layer -->
<rect x="30" y="120" width="840" height="26" class="arch-box" style="stroke:var(--accent);fill:rgba(46,230,138,.08)"/>
<text x="450" y="138" text-anchor="middle" class="arch-sublabel" style="fill:var(--accent)">Cilium eBPF: L7 NetworkPolicy + mTLS + WireGuard node-to-node + Hubble observability</text>

<!-- gVisor Runtime -->
<rect x="30" y="155" width="840" height="26" class="arch-box" style="stroke:var(--accent2);fill:rgba(63,185,80,.08)"/>
<text x="450" y="173" text-anchor="middle" class="arch-sublabel" style="fill:var(--accent2)">gVisor RuntimeClass: user-space kernel sandbox for all tenant pods</text>

<!-- Hot Tier -->
<rect x="30" y="200" width="520" height="120" rx="12" style="fill:none;stroke:var(--danger);stroke-width:2"/>
<text x="290" y="220" text-anchor="middle" class="arch-label" style="fill:var(--danger)">🔥 HOT TIER — 2,500 active pods in RAM</text>

<rect x="45" y="230" width="80" height="28" class="arch-box"/><text x="85" y="249" text-anchor="middle" class="arch-sublabel">🐾 Pod</text>
<rect x="135" y="230" width="80" height="28" class="arch-box"/><text x="175" y="249" text-anchor="middle" class="arch-sublabel">🐾 Pod</text>
<rect x="225" y="230" width="80" height="28" class="arch-box"/><text x="265" y="249" text-anchor="middle" class="arch-sublabel">🐾 Pod</text>
<rect x="315" y="230" width="80" height="28" class="arch-box"/><text x="355" y="249" text-anchor="middle" class="arch-sublabel">🐾 Pod</text>
<rect x="405" y="230" width="80" height="28" class="arch-box"/><text x="445" y="249" text-anchor="middle" class="arch-sublabel">🐾 ...</text>
<text x="290" y="292" text-anchor="middle" class="arch-sublabel">~20 hot nodes × AX162 (128GB) = 1.4 TB hot RAM</text>

<!-- Cold Tier -->
<rect x="570" y="200" width="300" height="120" rx="12" style="fill:none;stroke:var(--accent);stroke-width:2"/>
<text x="720" y="220" text-anchor="middle" class="arch-label" style="fill:var(--accent)">❄️ COLD TIER — suspended to NVMe</text>

<rect x="585" y="235" width="130" height="24" class="arch-box" style="fill:#0d1117"/><text x="650" y="252" text-anchor="middle" class="arch-sublabel" style="fill:var(--text-muted)">💾 47,500 snapshots</text>
<rect x="585" y="268" width="270" height="24" class="arch-box" style="fill:#0d1117"/><text x="720" y="285" text-anchor="middle" class="arch-sublabel" style="fill:var(--text-muted)">10 storage nodes × 4TB NVMe each</text>

<!-- Vault -->
<rect x="30" y="345" width="260" height="36" class="arch-box" style="stroke:var(--purple)"/>
<text x="160" y="368" text-anchor="middle" class="arch-label" style="fill:var(--purple)">🔐 HashiCorp Vault (secrets)</text>

<!-- Server layer -->
<rect x="30" y="400" width="840" height="40" class="arch-box" style="stroke:var(--accent3)"/>
<text x="450" y="425" text-anchor="middle" class="arch-label" style="fill:var(--accent3)">80× Hetzner AX162 — Full K8s cluster (etcd HA, 3 control planes)</text>

<!-- Monitoring -->
<rect x="320" y="345" width="230" height="36" class="arch-box" style="stroke:var(--accent2)"/>
<text x="435" y="368" text-anchor="middle" class="arch-label" style="fill:var(--accent2)">📊 Prometheus + Grafana</text>

<rect x="580" y="345" width="290" height="36" class="arch-box" style="stroke:var(--danger)"/>
<text x="725" y="368" text-anchor="middle" class="arch-label" style="fill:var(--danger)">🚨 Falco + OPA Gatekeeper (security)</text>

<!-- Security boundaries label -->
<rect x="20" y="190" width="860" height="260" class="security-boundary" style="stroke:var(--accent2)"/>
<text x="30" y="472" class="boundary-label" style="fill:var(--accent2)">✅ Defense in depth: gVisor sandbox → Cilium network → K8s RBAC → Vault secrets → Falco detection</text>
</svg>
</div>

<h3>Security Boundaries Summary</h3>
<div class="card">
<table>
<tr><th>Layer</th><th>Current Setup</th><th>K3s (5K)</th><th>K8s (50K)</th></tr>
<tr>
<td><strong>Ingress</strong></td>
<td>nginx + WireGuard</td>
<td>Traefik + TLS</td>
<td>Cilium Ingress + mTLS</td>
</tr>
<tr>
<td><strong>Network</strong></td>
<td>Docker bridge (shared)</td>
<td>Cilium NetworkPolicy</td>
<td>Cilium L7 + WireGuard node encryption</td>
</tr>
<tr>
<td><strong>Runtime</strong></td>
<td>runc (shared kernel)</td>
<td>runc + seccomp profiles</td>
<td>gVisor (user-space kernel)</td>
</tr>
<tr>
<td><strong>Secrets</strong></td>
<td>Env vars in Docker</td>
<td>K8s Secrets (per namespace)</td>
<td>HashiCorp Vault + CSI driver</td>
</tr>
<tr>
<td><strong>Access Control</strong></td>
<td>SSH keys only</td>
<td>K8s RBAC</td>
<td>K8s RBAC + OPA policies</td>
</tr>
<tr>
<td><strong>Monitoring</strong></td>
<td>Manual (docker logs)</td>
<td>Prometheus + Falco</td>
<td>Prometheus + Falco + Hubble</td>
</tr>
<tr>
<td><strong>Detection</strong></td>
<td>None</td>
<td>Falco basic rules</td>
<td>Falco + custom rules + SIEM</td>
</tr>
</table>
</div>
</div>
</section>

<!-- ============================================================ -->
<!-- SECTION 4: SECURITY THREAT MODEL -->
<!-- ============================================================ -->
<section id="threat-model">
<div class="container">
<h2>🎯 Security Threat Model</h2>
<p style="color:var(--text-muted);margin-bottom:24px">Attack vectors and mitigations at each architecture level</p>

<div class="card">
<h3>Threat Matrix by Architecture</h3>
<table>
<tr>
<th>Attack Vector</th>
<th>Severity</th>
<th>🟡 Workspaces</th>
<th>🟢 Containers</th>
<th>🔵 K8s + gVisor</th>
</tr>
<tr>
<td><strong>T1: Container/Process Escape</strong></td>
<td class="severity-critical">Critical</td>
<td>N/A (already shared)</td>
<td>Possible via kernel exploits (runc CVEs)</td>
<td>Blocked — gVisor intercepts syscalls; even escape hits user-space kernel, not host</td>
</tr>
<tr>
<td><strong>T2: Secrets Exfiltration</strong></td>
<td class="severity-critical">Critical</td>
<td>Trivial — shared memory</td>
<td>Requires container escape first</td>
<td>Vault + namespace RBAC; encrypted at rest; pod identity required</td>
</tr>
<tr>
<td><strong>T3: Network Sniffing</strong></td>
<td class="severity-high">High</td>
<td>Trivial — shared network</td>
<td>Possible on Docker bridge without iptables</td>
<td>Blocked — Cilium NetworkPolicy + WireGuard encryption</td>
</tr>
<tr>
<td><strong>T4: Resource Exhaustion (DoS)</strong></td>
<td class="severity-high">High</td>
<td>One tenant kills all</td>
<td>Possible without cgroups limits</td>
<td>Blocked — ResourceQuota + LimitRange per namespace</td>
</tr>
<tr>
<td><strong>T5: Lateral Movement</strong></td>
<td class="severity-high">High</td>
<td>All tenants reachable</td>
<td>Other containers on same host</td>
<td>Blocked — default deny NetworkPolicy + namespace isolation</td>
</tr>
<tr>
<td><strong>T6: Malicious Skill/Plugin</strong></td>
<td class="severity-high">High</td>
<td>Full access to all tenants</td>
<td>Contained to single container</td>
<td>Contained + detected by Falco + gVisor blocks dangerous syscalls</td>
</tr>
<tr>
<td><strong>T7: Supply Chain Attack</strong></td>
<td class="severity-high">High</td>
<td>Affects all tenants instantly</td>
<td>Affects all containers using compromised image</td>
<td>Image signing (cosign), admission control (OPA), per-tenant image policies</td>
</tr>
<tr>
<td><strong>T8: Privilege Escalation</strong></td>
<td class="severity-critical">Critical</td>
<td>Direct root access risk</td>
<td>Within container only (unless escape)</td>
<td>PodSecurityStandards enforce non-root + drop capabilities + seccomp</td>
</tr>
<tr>
<td><strong>T9: Data at Rest Access</strong></td>
<td class="severity-medium">Medium</td>
<td>Shared filesystem</td>
<td>Isolated overlay2, but shared host disk</td>
<td>Encrypted PVs + per-tenant storage classes</td>
</tr>
<tr>
<td><strong>T10: API Server Abuse</strong></td>
<td class="severity-medium">Medium</td>
<td>N/A</td>
<td>N/A (no API server)</td>
<td>RBAC restricts tenant to own namespace; audit logging</td>
</tr>
</table>
</div>

<div class="danger-box">
<h4>🔴 Critical Finding: Workspaces Model is Unacceptable for Production</h4>
<p>The workspaces model (shared process) fails on <strong>7 out of 10</strong> threat vectors with no mitigation possible. A single compromised tenant can:</p>
<ul>
<li>Read all other tenants' API keys from process memory</li>
<li>Intercept all network traffic</li>
<li>Execute code as any other tenant</li>
<li>Crash or DoS the entire platform</li>
</ul>
<p><strong>Verdict: Only usable for free/trial tiers where no sensitive data is stored.</strong></p>
</div>

<h3>Detailed Threat Scenarios</h3>

<div class="card">
<h4>T1: Multi-Tenant Container Escape</h4>
<p><strong>Scenario:</strong> Attacker exploits a vulnerability in a tenant's OpenClaw agent (e.g., through a malicious skill) to gain code execution. They then exploit a container runtime vulnerability (runc, containerd) or kernel vulnerability to escape to the host.</p>
<p><strong>Recent real-world examples:</strong></p>
<ul>
<li>CVE-2024-21626 (runc): Container escape via leaked file descriptor. Patched in runc 1.1.12.</li>
<li>CVE-2022-0185: Kernel heap overflow in filesystem context. Container escape on unprivileged containers.</li>
<li>CVE-2020-15257: containerd access control bypass via abstract Unix sockets.</li>
</ul>
<p><strong>Mitigations by tier:</strong></p>
<table>
<tr><th>Tier</th><th>Mitigation</th><th>Residual Risk</th></tr>
<tr><td>Containers</td><td>Keep runc/containerd updated, seccomp profiles, drop all capabilities, read-only rootfs</td><td class="severity-medium">Medium — kernel shared</td></tr>
<tr><td>K8s + gVisor</td><td>gVisor intercepts syscalls in user-space; kernel exploits don't pass through</td><td class="severity-low">Low — attacker hits gVisor, not kernel</td></tr>
<tr><td>K8s + Kata/Firecracker</td><td>Hardware VM boundary; each pod has own kernel</td><td class="severity-low">Minimal — VM escape extremely rare</td></tr>
</table>
</div>

<div class="card">
<h4>T6: Malicious Skills/Plugins (Supply Chain)</h4>
<p><strong>Scenario:</strong> A tenant installs a malicious OpenClaw skill that attempts to: read environment variables (API keys), make unauthorized network requests, mine crypto, or establish reverse shells.</p>
<p><strong>This is our most likely attack vector</strong> because skills are user-installable code running inside the agent container.</p>
<p><strong>Defense-in-depth approach:</strong></p>
<ul>
<li><strong>Layer 1 — Skill sandbox:</strong> Skills run with restricted permissions within OpenClaw (application-level)</li>
<li><strong>Layer 2 — Container limits:</strong> cgroups CPU/memory limits prevent crypto mining. Read-only rootfs prevents persistence.</li>
<li><strong>Layer 3 — Network policy:</strong> Cilium restricts egress to known API endpoints only (OpenAI, Anthropic, etc.). No arbitrary outbound connections.</li>
<li><strong>Layer 4 — Runtime detection:</strong> Falco alerts on: unexpected process spawning, sensitive file reads (/etc/shadow, /proc/1/environ), reverse shell patterns.</li>
<li><strong>Layer 5 — gVisor:</strong> Blocks dangerous syscalls entirely. Malicious code cannot access host kernel primitives.</li>
</ul>
</div>

<div class="rec">
<h4>🏆 Security Recommendations by Tier</h4>
<table>
<tr><th>Scale</th><th>Minimum Security Stack</th><th>Recommended Security Stack</th></tr>
<tr>
<td><strong>60 (now)</strong></td>
<td>Docker + seccomp + capability drop + regular updates</td>
<td>Same + AppArmor profiles + egress firewall rules</td>
</tr>
<tr>
<td><strong>5K</strong></td>
<td>K3s + namespaces + NetworkPolicy (Cilium) + RBAC</td>
<td>+ gVisor runtime + Falco + Vault for secrets</td>
</tr>
<tr class="highlight-row">
<td><strong>50K</strong></td>
<td>K8s + Cilium + gVisor + Vault + Falco</td>
<td>+ OPA Gatekeeper + image signing + audit logging + SIEM</td>
</tr>
<tr>
<td><strong>500K</strong></td>
<td>K8s + Kata/Firecracker + Cilium + Vault + Falco + OPA</td>
<td>+ Dedicated security team + bug bounty + SOC2 cert + pen testing</td>
</tr>
</table>
</div>
</div>
</section>

<!-- ============================================================ -->
<!-- SECTION 5: MEMORY & COST DEEP DIVE -->
<!-- ============================================================ -->
<section id="memory-cost">
<div class="container">
<h2>💾 Memory & Cost Deep Dive</h2>

<h3>Memory Breakdown per Tenant</h3>
<div class="card">
<table>
<tr>
<th>Component</th>
<th>🟡 Workspaces</th>
<th>🟢 Container</th>
<th>🔵 K8s Pod</th>
<th>🟣 K8s + gVisor</th>
<th>🔴 Kata/Firecracker</th>
</tr>
<tr>
<td>OS / kernel overhead</td>
<td>Shared (0)</td>
<td>Shared (0)</td>
<td>Shared (0)</td>
<td>gVisor Sentry: ~20MB</td>
<td>Guest kernel: ~30MB</td>
</tr>
<tr>
<td>Node.js runtime</td>
<td>Shared (~80MB once)</td>
<td>~80MB per container</td>
<td>~80MB per pod</td>
<td>~80MB per pod</td>
<td>~80MB per VM</td>
</tr>
<tr>
<td>OpenClaw core + deps</td>
<td>Shared (~120MB once)</td>
<td>~120MB per container</td>
<td>~120MB per pod</td>
<td>~120MB per pod</td>
<td>~120MB per VM</td>
</tr>
<tr>
<td>Per-tenant workspace</td>
<td>~15-30MB</td>
<td>~15-30MB</td>
<td>~15-30MB</td>
<td>~15-30MB</td>
<td>~15-30MB</td>
</tr>
<tr>
<td>Active session state</td>
<td>~50MB (if active)</td>
<td>~150MB (if active)</td>
<td>~150MB (if active)</td>
<td>~150MB (if active)</td>
<td>~150MB (if active)</td>
</tr>
<tr>
<td>Container/runtime overhead</td>
<td>0</td>
<td>~10MB</td>
<td>~15MB (kubelet)</td>
<td>~35MB (gVisor)</td>
<td>~45MB (VMM + kernel)</td>
</tr>
<tr class="highlight-row">
<td><strong>Total (idle)</strong></td>
<td class="cost-low"><strong>~15-30MB</strong></td>
<td><strong>~380MB</strong></td>
<td><strong>~400MB</strong></td>
<td><strong>~420MB</strong></td>
<td><strong>~450MB</strong></td>
</tr>
<tr class="highlight-row">
<td><strong>Total (active)</strong></td>
<td class="cost-low"><strong>~80-100MB</strong></td>
<td><strong>~550MB</strong></td>
<td><strong>~580MB</strong></td>
<td><strong>~600MB</strong></td>
<td><strong>~640MB</strong></td>
</tr>
</table>
</div>

<h3>Memory Optimization Techniques</h3>
<div class="card-grid">
<div class="card">
<h4>🔄 Copy-on-Write (CoW) Filesystem</h4>
<p>Docker's overlay2 filesystem shares read-only base layers. All containers from the same image share ~200MB of base image in kernel page cache. Only modified files are per-container.</p>
<p><strong>Savings at 5K:</strong> ~950GB (from sharing the OpenClaw base image)</p>
<p><strong>Already active</strong> in our current Docker setup.</p>
</div>

<div class="card">
<h4>🧬 KSM (Kernel Same-page Merging)</h4>
<p>Linux KSM scans memory pages and deduplicates identical pages across processes. Since all OpenClaw containers run the same Node.js + OpenClaw code, many memory pages are identical.</p>
<p><strong>Expected dedup ratio:</strong> 30-50% for identical containers</p>
<p><strong>Savings at 5K:</strong> ~500-900GB RAM</p>
<p><strong>Trade-off:</strong> CPU overhead for scanning (~2-5% of one core). Enable with: <code>echo 1 > /sys/kernel/mm/ksm/run</code></p>
</div>

<div class="card">
<h4>📦 Image Size Optimization</h4>
<p>Current OpenClaw image: ~800MB. Optimization targets:</p>
<ul>
<li><strong>Multi-stage build:</strong> Strip build deps → ~400MB</li>
<li><strong>Alpine base:</strong> ~300MB (vs Debian ~800MB)</li>
<li><strong>Distroless:</strong> ~250MB (minimal attack surface too)</li>
<li><strong>Node.js slim:</strong> Remove npm, docs → save ~50MB</li>
</ul>
<p><strong>Disk savings at 50K:</strong> ~25TB (from 40TB to 15TB)</p>
</div>

<div class="card">
<h4>⏸️ Hot/Cold with CRIU</h4>
<p>CRIU (Checkpoint/Restore in Userspace) dumps container memory to disk and restores it. Key for scale:</p>
<ul>
<li><strong>Checkpoint:</strong> Freeze container → dump to NVMe (~200-500ms)</li>
<li><strong>Restore:</strong> Load from NVMe → resume (~1-3s)</li>
<li><strong>Storage per checkpoint:</strong> ~200-400MB (compressed)</li>
</ul>
<p><strong>RAM savings at 50K:</strong> 47,500 idle containers × 380MB = <strong>~18TB saved</strong></p>
</div>
</div>

<h3>Cost per Tenant at Scale</h3>
<div class="card">
<table>
<tr>
<th>Scale</th>
<th>Model</th>
<th>Total RAM Needed</th>
<th>Servers (AX162)</th>
<th>Monthly Cost</th>
<th>Cost/Tenant/mo</th>
</tr>
<tr>
<td rowspan="3"><strong>5K</strong></td>
<td>🟡 Workspaces</td>
<td>~75GB (all idle) / ~10GB (active only)</td>
<td>1</td>
<td class="cost-low">€150</td>
<td class="cost-low">€0.03</td>
</tr>
<tr>
<td>🟢 Containers (all running)</td>
<td>~1.9TB</td>
<td>8</td>
<td>€1,200</td>
<td>€0.24</td>
</tr>
<tr>
<td>🔵 K8s + gVisor</td>
<td>~2.1TB</td>
<td>9</td>
<td>€1,350</td>
<td>€0.27</td>
</tr>

<tr>
<td rowspan="4"><strong>50K</strong></td>
<td>🟡 Workspaces</td>
<td>~750GB / ~100GB active</td>
<td>3</td>
<td class="cost-low">€450</td>
<td class="cost-low">€0.009</td>
</tr>
<tr>
<td>🟢 Containers (all running)</td>
<td>~19TB</td>
<td>155</td>
<td class="cost-high">€23,250</td>
<td>€0.47</td>
</tr>
<tr>
<td>🟢 Containers (hot/cold)</td>
<td>~1.4TB hot + NVMe</td>
<td>30</td>
<td class="cost-low">€4,500</td>
<td>€0.09</td>
</tr>
<tr class="highlight-row">
<td>🔵 K8s + gVisor (hot/cold)</td>
<td>~1.5TB hot + NVMe</td>
<td>32</td>
<td>€4,800</td>
<td>€0.096</td>
</tr>

<tr>
<td rowspan="3"><strong>500K</strong></td>
<td>🟡 Workspaces</td>
<td>~7.5TB / ~1TB active</td>
<td>12</td>
<td class="cost-low">€1,800</td>
<td class="cost-low">€0.004</td>
</tr>
<tr>
<td>🟢 Containers (hot/cold)</td>
<td>~5.5TB hot + 90TB NVMe</td>
<td>~100</td>
<td class="cost-mid">€22,500</td>
<td>€0.045</td>
</tr>
<tr class="highlight-row">
<td>🔵 K8s + gVisor (hot/cold)</td>
<td>~6TB hot + 90TB NVMe</td>
<td>~110</td>
<td class="cost-mid">€25,000</td>
<td>€0.05</td>
</tr>
</table>
</div>

<div class="rec">
<h4>🏆 Memory & Cost Verdict</h4>
<p><strong>The container model adds ~12× memory overhead vs workspaces</strong> — but that's the cost of security isolation. At scale with hot/cold scheduling, the effective overhead drops to ~3-5× because most tenants are suspended.</p>
<p><strong>gVisor adds only ~5% overhead</strong> over standard containers, making it the best security upgrade for the cost. Kata/Firecracker adds ~15% but provides VM-level isolation.</p>
<p><strong>Key insight:</strong> At 50K+ tenants, the architecture (hot/cold vs all-running) matters 10× more than the runtime choice (gVisor vs runc). Focus engineering effort on the scheduler first, then harden the runtime.</p>
</div>

<h3>Overhead Comparison Visualization</h3>
<div class="card">
<p style="color:var(--text-muted);margin-bottom:12px">Memory per tenant (idle) — lower is better</p>
<div style="display:flex;flex-direction:column;gap:8px">
<div style="display:flex;align-items:center;gap:12px">
<span style="width:180px;text-align:right;font-size:.85rem">Workspaces</span>
<div style="flex:1;background:var(--surface2);border-radius:4px;height:28px;overflow:hidden"><div style="width:3.3%;height:100%;background:var(--accent2);border-radius:4px"></div></div>
<span style="min-width:80px;font-size:.85rem;color:var(--text-muted)">~15MB</span>
</div>
<div style="display:flex;align-items:center;gap:12px">
<span style="width:180px;text-align:right;font-size:.85rem">Docker Container</span>
<div style="flex:1;background:var(--surface2);border-radius:4px;height:28px;overflow:hidden"><div style="width:84%;height:100%;background:var(--accent3);border-radius:4px"></div></div>
<span style="min-width:80px;font-size:.85rem;color:var(--text-muted)">~380MB</span>
</div>
<div style="display:flex;align-items:center;gap:12px">
<span style="width:180px;text-align:right;font-size:.85rem">K8s Pod</span>
<div style="flex:1;background:var(--surface2);border-radius:4px;height:28px;overflow:hidden"><div style="width:89%;height:100%;background:var(--accent);border-radius:4px"></div></div>
<span style="min-width:80px;font-size:.85rem;color:var(--text-muted)">~400MB</span>
</div>
<div style="display:flex;align-items:center;gap:12px">
<span style="width:180px;text-align:right;font-size:.85rem">K8s + gVisor</span>
<div style="flex:1;background:var(--surface2);border-radius:4px;height:28px;overflow:hidden"><div style="width:93%;height:100%;background:var(--purple);border-radius:4px"></div></div>
<span style="min-width:80px;font-size:.85rem;color:var(--text-muted)">~420MB</span>
</div>
<div style="display:flex;align-items:center;gap:12px">
<span style="width:180px;text-align:right;font-size:.85rem">Kata/Firecracker</span>
<div style="flex:1;background:var(--surface2);border-radius:4px;height:28px;overflow:hidden"><div style="width:100%;height:100%;background:var(--danger);border-radius:4px"></div></div>
<span style="min-width:80px;font-size:.85rem;color:var(--text-muted)">~450MB</span>
</div>
</div>
</div>
</div>
</section>

<!-- ============================================================ -->
<!-- SECTION 6: RECOMMENDATIONS -->
<!-- ============================================================ -->
<section id="recommendations">
<div class="container">
<h2>🏆 Final Recommendations</h2>

<div class="card-grid">
<div class="card" style="border-color:var(--accent2)">
<h3 style="color:var(--accent2)">Top 5 Open Source Projects</h3>
<ol>
<li><strong>K3s</strong> — Our orchestrator for 5K tier. Lightweight, full K8s API, battle-tested.</li>
<li><strong>Cilium</strong> — Must-have for multi-tenant networking. L7 policies, WireGuard, Hubble observability.</li>
<li><strong>gVisor</strong> — Best security/overhead ratio. 5% memory cost for kernel-level sandboxing.</li>
<li><strong>KEDA</strong> — Essential for hot/cold architecture. Scale-to-zero = massive cost savings.</li>
<li><strong>Falco</strong> — Runtime threat detection. Catches escape attempts, malicious skills, anomalies.</li>
</ol>
</div>

<div class="card" style="border-color:var(--accent)">
<h3 style="color:var(--accent)">Recommended Stack by Tier</h3>
<table>
<tr><th>Tier</th><th>Stack</th></tr>
<tr><td>5K</td><td>K3s + Cilium + Falco + Traefik</td></tr>
<tr class="highlight-row"><td>50K</td><td>K8s + Cilium + gVisor + KEDA + Vault + Falco</td></tr>
<tr><td>500K</td><td>K8s + Kata/Firecracker + Cilium + KEDA + Vault + Falco + OPA</td></tr>
</table>
</div>
</div>

<div class="rec">
<h4>Security vs Cost: The Verdict</h4>
<p><strong>Containers (our current model) win for security-per-dollar.</strong> The workspaces model is 10-20× cheaper but provides zero isolation — unacceptable for a commercial product handling user API keys and sensitive data.</p>
<p><strong>Kubernetes wins at 50K+</strong> where the operational benefits (auto-healing, declarative network policies, RBAC, ecosystem) outweigh the ~10% overhead. Adding gVisor costs only 5% more memory but eliminates the most dangerous attack vector (kernel exploits).</p>
<p><strong>The hot/cold scheduler is the single most impactful cost optimization</strong> — reducing infrastructure cost by 5-10× at 50K+ scale. Invest engineering effort here first.</p>
</div>

<div class="warn">
<h4>⚡ Immediate Action Items</h4>
<ol>
<li><strong>Now:</strong> Add seccomp profiles + capability dropping to current Docker containers (free security win)</li>
<li><strong>Month 1:</strong> Set up K3s on 2 test nodes, deploy 10 agents with Cilium + namespaces</li>
<li><strong>Month 2:</strong> Add Falco for runtime detection on current production</li>
<li><strong>Month 3:</strong> Migrate to K3s cluster with full Cilium NetworkPolicy</li>
<li><strong>Month 6:</strong> Evaluate gVisor compatibility with OpenClaw, begin hot/cold scheduler prototype</li>
</ol>
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
          <Link href="/tech/security" style={{ color: '#2EE68A', fontSize: '.875rem', padding: '6px 12px', borderRadius: 6, textDecoration: 'none' }}>🛡️ Security</Link>
          <Link href="/tech/models" style={{ color: '#8b949e', fontSize: '.875rem', padding: '6px 12px', borderRadius: 6, textDecoration: 'none' }}>🐾 Models</Link>
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
