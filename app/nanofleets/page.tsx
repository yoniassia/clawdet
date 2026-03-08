'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './nanofleets.module.css'

export default function NanoFleets() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  return (
    <div className={styles.page}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🔍</span>
          <span className={styles.logoText}>Clawdet</span>
        </Link>
        <div className={styles.navLinks}>
          <a href="#architecture" className={styles.navLink}>Architecture</a>
          <a href="#pricing" className={styles.navLink}>Pricing</a>
          <a href="#security" className={styles.navLink}>Security</a>
          <a href="mailto:nanofleets@clawdet.com" className={styles.navCta}>Get Started</a>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeDot} />
          Built on NanoClaw
        </div>
        <h1 className={styles.heroTitle}>
          <span className={styles.heroTitleGreen}>NanoFleets</span>
          <br />
          AI Agent Fleet Management
          <br />
          <span className={styles.heroTitleSub}>for Companies</span>
        </h1>
        <p className={styles.heroDesc}>
          Deploy, manage, and scale fleets of personalized AI agents. 
          Each agent gets its own identity, memory, and skills — orchestrated 
          from a single dashboard. Powered by NanoClaw, hosted on dedicated infrastructure.
        </p>
        <div className={styles.heroActions}>
          <a href="mailto:nanofleets@clawdet.com" className={styles.ctaPrimary}>
            Request Early Access
          </a>
          <a href="#architecture" className={styles.ctaSecondary}>
            See Architecture →
          </a>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.stat}>
            <span className={styles.statNum}>~2s</span>
            <span className={styles.statLabel}>deploy time</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>90+</span>
            <span className={styles.statLabel}>agents per server</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>Tools</span>
            <span className={styles.statLabel}>bash + web + files</span>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>The Problem</h2>
          <div className={styles.problemGrid}>
            <div className={styles.problemCard}>
              <span className={styles.problemIcon}>💸</span>
              <h3>Chat-Only AI is Limiting</h3>
              <p>Most AI agents can only chat. They can't run code, search the web, 
                 or manage files. NanoFleets agents have real tools — bash, python, curl, 
                 file I/O — and use them proactively.</p>
            </div>
            <div className={styles.problemCard}>
              <span className={styles.problemIcon}>🔧</span>
              <h3>Managing Agents is Manual</h3>
              <p>Creating agents one by one. Configuring each. No fleet-level overview. 
                 NanoFleets gives you a control plane: deploy, monitor, and manage 
                 all agents from a single dashboard.</p>
            </div>
            <div className={styles.problemCard}>
              <span className={styles.problemIcon}>🔓</span>
              <h3>No Isolation Between Agents</h3>
              <p>Agents sharing the same context, memory, and permissions? Risky. 
                 Each NanoFleets agent runs in its own Docker container with 
                 isolated filesystem, memory, and auth tokens.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className={styles.section} id="architecture">
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Architecture</h2>
          <p className={styles.sectionDesc}>
            Docker containers with real tool use. ~2 second deploy. Full fleet control.
          </p>

          {/* Architecture Diagram */}
          <div className={styles.archDiagram}>
            <div className={styles.archLayer}>
              <div className={styles.archLabel}>Fleet Dashboard</div>
              <div className={styles.archBox} data-type="dashboard">
                <span>🖥️ NanoFleets Control Plane</span>
                <span className={styles.archSub}>clawdet.com/fleet • Agent CRUD • Health Monitoring • Billing</span>
              </div>
            </div>

            <div className={styles.archArrow}>▼</div>

            <div className={styles.archLayer}>
              <div className={styles.archLabel}>Company VPS (Hetzner ARM)</div>
              <div className={styles.archCompany}>
                <div className={styles.archVpsHeader}>
                  <span>🏢 Acme Corp — cax31 (8 vCPU, 16GB RAM) — €12.49/mo</span>
                </div>
                <div className={styles.archDockerGrid}>
                  {[
                    { name: 'Sales Bot', emoji: '🤝', channel: 'Slack', model: 'Sonnet 4.5' },
                    { name: 'Support Agent', emoji: '🎧', channel: 'Zendesk', model: 'Haiku 3.5' },
                    { name: 'Code Reviewer', emoji: '👨‍💻', channel: 'GitHub', model: 'Opus 4' },
                    { name: 'Data Analyst', emoji: '📊', channel: 'Telegram', model: 'GPT-4.1' },
                    { name: 'HR Assistant', emoji: '👥', channel: 'WhatsApp', model: 'Sonnet 4.5' },
                    { name: 'Ops Monitor', emoji: '🔍', channel: 'Discord', model: 'Grok 3' },
                  ].map((agent, i) => (
                    <div key={i} className={styles.archAgent}>
                      <div className={styles.archAgentHeader}>
                        <span>{agent.emoji} {agent.name}</span>
                      </div>
                      <div className={styles.archAgentDetails}>
                        <span className={styles.archTag}>{agent.channel}</span>
                        <span className={styles.archTag}>{agent.model}</span>
                      </div>
                      <div className={styles.archAgentStack}>
                        <div className={styles.archMicro}>NanoClaw Container</div>
                        <div className={styles.archMicro}>CLAUDE.md + Memory</div>
                        <div className={styles.archMicro}>Skills + Tools</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.archInfra}>
                  <span className={styles.archInfraItem}>🐳 Docker Compose</span>
                  <span className={styles.archInfraItem}>🔒 Caddy (SSL/Proxy)</span>
                  <span className={styles.archInfraItem}>📦 Git Sync</span>
                  <span className={styles.archInfraItem}>📡 Fleet Agent</span>
                </div>
              </div>
            </div>

            <div className={styles.archArrow}>▼</div>

            <div className={styles.archLayer}>
              <div className={styles.archLabel}>AI Providers (BYOK)</div>
              <div className={styles.archProviders}>
                <span className={styles.archProvider}>Anthropic</span>
                <span className={styles.archProvider}>OpenAI</span>
                <span className={styles.archProvider}>xAI</span>
                <span className={styles.archProvider}>Google</span>
                <span className={styles.archProvider}>Local (Ollama)</span>
              </div>
            </div>
          </div>

          {/* Architecture Details */}
          <div className={styles.archDetails}>
            <div className={styles.archDetail}>
              <h3>🐳 Container-Level Isolation</h3>
              <p>Each agent runs in its own Linux container with dedicated 
                 NanoClaw instance, isolated filesystem, and persistent memory. No shared state between agents.
                 Resource limits per container prevent any single agent from starving others.</p>
            </div>
            <div className={styles.archDetail}>
              <h3>📦 Git-Synced Configuration</h3>
              <p>Every agent's config — CLAUDE.md, skills, tools, memory — lives in a 
                 Git repository. Push changes to deploy. Roll back mistakes. Audit every 
                 edit. Branch and test before going live.</p>
            </div>
            <div className={styles.archDetail}>
              <h3>🔒 Company-Level VPS</h3>
              <p>Your agents run on dedicated Hetzner ARM VPS — not shared with 
                 other companies. Full disk encryption, SSH key auth only, 
                 automated security patches. Your data never leaves your server.</p>
            </div>
            <div className={styles.archDetail}>
              <h3>📡 Fleet Agent (Supervisor)</h3>
              <p>A lightweight daemon on each VPS reports health, metrics, and logs 
                 back to the control plane. Handles auto-restarts, updates, and 
                 container orchestration. You manage the fleet — it manages the servers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNum}>01</div>
              <h3>Create Your Fleet</h3>
              <p>Sign up, pick a plan. We provision a dedicated Hetzner VPS 
                 for your company in under 90 seconds. Docker, Caddy, Git — all pre-configured.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNum}>02</div>
              <h3>Define Your Agents</h3>
              <p>Give each agent a name, personality (SOUL.md), skills, and channel 
                 (Slack, Telegram, WhatsApp, Discord, email). Pick their AI model. 
                 Push to Git or use the dashboard.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNum}>03</div>
              <h3>Deploy & Monitor</h3>
              <p>One click deploys all agents. The fleet dashboard shows real-time 
                 health, message volume, costs per agent, memory usage, and alerts. 
                 Scale up by adding agents — or adding VPS nodes.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNum}>04</div>
              <h3>Iterate & Improve</h3>
              <p>Review agent conversations. Tune personalities. Add skills. 
                 A/B test different models. All changes are versioned in Git. 
                 Your agents get smarter over time — their memory persists.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className={styles.section} id="pricing">
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Pricing</h2>
          <p className={styles.sectionDesc}>
            Infrastructure at cost + per-agent management fee. No markup on AI API calls.
          </p>

          <div className={styles.pricingGrid}>
            {/* Starter */}
            <div className={styles.pricingCard}>
              <div className={styles.pricingTier}>Starter</div>
              <div className={styles.pricingPrice}>
                <span className={styles.pricingAmount}>$29</span>
                <span className={styles.pricingPeriod}>/month</span>
              </div>
              <div className={styles.pricingInfra}>
                Hetzner cax11 · 2 vCPU · 4GB RAM
              </div>
              <ul className={styles.pricingFeatures}>
                <li>Up to <strong>5 agents</strong></li>
                <li>Docker isolation per agent</li>
                <li>Git-synced config</li>
                <li>Fleet dashboard</li>
                <li>Health monitoring</li>
                <li>SSL + custom subdomains</li>
                <li>Email support</li>
              </ul>
              <div className={styles.pricingBreakdown}>
                <div className={styles.breakdownRow}>
                  <span>VPS (cax11)</span>
                  <span>~$4.00</span>
                </div>
                <div className={styles.breakdownRow}>
                  <span>5 agents × $5</span>
                  <span>$25.00</span>
                </div>
                <div className={styles.breakdownDivider} />
                <div className={styles.breakdownRow}>
                  <span><strong>Effective cost/agent</strong></span>
                  <span><strong>$5.80</strong></span>
                </div>
              </div>
              <a href="mailto:nanofleets@clawdet.com" className={styles.pricingCta}>
                Get Started
              </a>
            </div>

            {/* Growth */}
            <div className={`${styles.pricingCard} ${styles.pricingFeatured}`}>
              <div className={styles.pricingBadge}>Most Popular</div>
              <div className={styles.pricingTier}>Growth</div>
              <div className={styles.pricingPrice}>
                <span className={styles.pricingAmount}>$99</span>
                <span className={styles.pricingPeriod}>/month</span>
              </div>
              <div className={styles.pricingInfra}>
                Hetzner cax21 · 4 vCPU · 8GB RAM
              </div>
              <ul className={styles.pricingFeatures}>
                <li>Up to <strong>15 agents</strong></li>
                <li>Everything in Starter, plus:</li>
                <li>Cross-agent communication</li>
                <li>Fleet analytics & insights</li>
                <li>Scheduled tasks & cron</li>
                <li>Webhook integrations</li>
                <li>Priority support</li>
              </ul>
              <div className={styles.pricingBreakdown}>
                <div className={styles.breakdownRow}>
                  <span>VPS (cax21)</span>
                  <span>~$7.00</span>
                </div>
                <div className={styles.breakdownRow}>
                  <span>15 agents × $6.13</span>
                  <span>$92.00</span>
                </div>
                <div className={styles.breakdownDivider} />
                <div className={styles.breakdownRow}>
                  <span><strong>Effective cost/agent</strong></span>
                  <span><strong>$6.60</strong></span>
                </div>
              </div>
              <a href="mailto:nanofleets@clawdet.com" className={styles.pricingCtaFeatured}>
                Get Started
              </a>
            </div>

            {/* Enterprise */}
            <div className={styles.pricingCard}>
              <div className={styles.pricingTier}>Enterprise</div>
              <div className={styles.pricingPrice}>
                <span className={styles.pricingAmount}>$299</span>
                <span className={styles.pricingPeriod}>/month</span>
              </div>
              <div className={styles.pricingInfra}>
                Hetzner cax31 · 8 vCPU · 16GB RAM
              </div>
              <ul className={styles.pricingFeatures}>
                <li>Up to <strong>30 agents</strong></li>
                <li>Everything in Growth, plus:</li>
                <li>Multi-VPS cluster support</li>
                <li>SSO / SAML integration</li>
                <li>Custom skills development</li>
                <li>SLA guarantee (99.9%)</li>
                <li>Dedicated Slack channel</li>
                <li>Agent-to-agent workflows</li>
              </ul>
              <div className={styles.pricingBreakdown}>
                <div className={styles.breakdownRow}>
                  <span>VPS (cax31)</span>
                  <span>~$13.00</span>
                </div>
                <div className={styles.breakdownRow}>
                  <span>30 agents × $9.53</span>
                  <span>$286.00</span>
                </div>
                <div className={styles.breakdownDivider} />
                <div className={styles.breakdownRow}>
                  <span><strong>Effective cost/agent</strong></span>
                  <span><strong>$9.97</strong></span>
                </div>
              </div>
              <a href="mailto:nanofleets@clawdet.com" className={styles.pricingCta}>
                Contact Sales
              </a>
            </div>
          </div>

          <div className={styles.pricingNote}>
            <p>💡 <strong>BYOK (Bring Your Own Keys)</strong> — You provide your own AI API keys 
            (Anthropic, OpenAI, xAI, etc). We never touch your API spend. 
            NanoFleets charges only for infrastructure + orchestration.</p>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className={styles.section} id="security">
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Security & Isolation</h2>
          <div className={styles.securityGrid}>
            <div className={styles.securityItem}>
              <span className={styles.securityIcon}>🏰</span>
              <h3>Dedicated VPS</h3>
              <p>Your company's agents run on hardware isolated from other customers. 
                 No noisy neighbors. No shared attack surface.</p>
            </div>
            <div className={styles.securityItem}>
              <span className={styles.securityIcon}>🐳</span>
              <h3>Container Isolation</h3>
              <p>Each agent is sandboxed in its own Docker container with resource limits, 
                 separate filesystem, and no inter-container network access by default.</p>
            </div>
            <div className={styles.securityItem}>
              <span className={styles.securityIcon}>🔑</span>
              <h3>SSH Key Auth Only</h3>
              <p>Password auth disabled. Only your authorized SSH keys can access the VPS. 
                 Fleet management uses mTLS certificates.</p>
            </div>
            <div className={styles.securityItem}>
              <span className={styles.securityIcon}>📝</span>
              <h3>Full Audit Trail</h3>
              <p>Every config change versioned in Git. Every agent action logged. 
                 Every API call tracked. Full compliance-ready audit trail.</p>
            </div>
            <div className={styles.securityItem}>
              <span className={styles.securityIcon}>🔐</span>
              <h3>Encrypted at Rest</h3>
              <p>Agent memory, configs, and data encrypted on disk. 
                 API keys stored in encrypted vaults, never in plaintext configs.</p>
            </div>
            <div className={styles.securityItem}>
              <span className={styles.securityIcon}>🛡️</span>
              <h3>Auto-Patching</h3>
              <p>Automated security updates for the host OS, Docker, and NanoClaw. 
                 Zero-downtime rolling updates for agent containers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Use Cases</h2>
          <div className={styles.useCases}>
            <div className={styles.useCase}>
              <div className={styles.useCaseIcon}>🏢</div>
              <h3>Department Agents</h3>
              <p>One agent per team — Sales, Support, Engineering, HR, Finance. 
                 Each with its own personality, knowledge base, and channel. 
                 The CEO gets a meta-agent that coordinates all of them.</p>
            </div>
            <div className={styles.useCase}>
              <div className={styles.useCaseIcon}>🏪</div>
              <h3>Multi-Location Retail</h3>
              <p>Each store gets its own AI assistant that knows local inventory, 
                 staff schedules, and customer preferences. Fleet dashboard gives 
                 HQ visibility across all locations.</p>
            </div>
            <div className={styles.useCase}>
              <div className={styles.useCaseIcon}>🏥</div>
              <h3>Healthcare Practice</h3>
              <p>Separate agents for patient intake, appointment scheduling, 
                 insurance queries, and follow-ups. HIPAA-compliant isolation. 
                 Each agent only accesses the data it needs.</p>
            </div>
            <div className={styles.useCase}>
              <div className={styles.useCaseIcon}>🎓</div>
              <h3>Education</h3>
              <p>Per-course AI tutors with subject-specific knowledge and teaching styles. 
                 A math tutor that thinks differently from a writing coach. 
                 Shared skills library across the fleet.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>FAQ</h2>
          <div className={styles.faqList}>
            {[
              {
                q: 'What AI models can my agents use?',
                a: 'Any model supported by NanoClaw — Claude (Anthropic), GPT-4 (OpenAI), Grok (xAI), Gemini (Google), or local models via Ollama. Each agent can use a different model. You bring your own API keys — we never see or markup your AI spend.'
              },
              {
                q: 'What channels can agents connect to?',
                a: 'Telegram, WhatsApp, Slack, Discord, iMessage, Signal, Google Chat, IRC, and web chat. Each agent can connect to multiple channels simultaneously.'
              },
              {
                q: 'Can agents talk to each other?',
                a: 'Yes — on Growth and Enterprise plans, agents can communicate via cross-agent messaging. Build workflows where a sales agent hands off to onboarding, or where a triage bot routes to specialists.'
              },
              {
                q: 'Where are the servers located?',
                a: 'Hetzner datacenters in Helsinki (Finland) and Falkenstein/Nuremberg (Germany). EU-based, GDPR-compliant. US locations coming soon.'
              },
              {
                q: 'Can I SSH into my VPS?',
                a: 'Yes. You get full root SSH access to your company\'s VPS. The fleet dashboard is a convenience layer — you always have escape-hatch access to the metal.'
              },
              {
                q: 'What happens if an agent crashes?',
                a: 'The Fleet Agent (supervisor daemon) auto-restarts crashed containers within seconds. The control plane alerts you via your preferred channel. Health checks run every 30 seconds.'
              },
              {
                q: 'How do updates work?',
                a: 'Push to your Git repo → Fleet Agent pulls changes → rolling restart of affected agents. Zero downtime. You can also update via the dashboard. NanoClaw updates are applied automatically during maintenance windows.'
              },
            ].map((faq, i) => (
              <div 
                key={i} 
                className={`${styles.faqItem} ${expandedFaq === i ? styles.faqExpanded : ''}`}
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
              >
                <div className={styles.faqQuestion}>
                  <span>{faq.q}</span>
                  <span className={styles.faqToggle}>{expandedFaq === i ? '−' : '+'}</span>
                </div>
                {expandedFaq === i && (
                  <div className={styles.faqAnswer}>{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaGlow} />
        <h2 className={styles.ctaTitle}>Ready to deploy your AI fleet?</h2>
        <p className={styles.ctaDesc}>
          Early access is open. First 10 companies get 3 months free on any plan.
        </p>
        <div className={styles.ctaActions}>
          <a href="mailto:nanofleets@clawdet.com?subject=NanoFleets Early Access" className={styles.ctaPrimary}>
            Request Early Access
          </a>
        </div>
        <p className={styles.ctaSmall}>
          No commitment. No credit card. Just tell us what you're building.
        </p>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <span className={styles.logoIcon}>🔍</span>
            <span className={styles.logoText}>Clawdet</span>
            <span className={styles.footerSub}>NanoFleets</span>
          </div>
          <div className={styles.footerLinks}>
            <Link href="/">Clawdet Home</Link>
            <a href="https://github.com/qwibitai/nanoclaw" target="_blank" rel="noopener">NanoClaw</a>
            <a href="mailto:nanofleets@clawdet.com">Contact</a>
          </div>
          <p className={styles.footerCopy}>© 2026 Clawdet. Built with NanoClaw.</p>
        </div>
      </footer>
    </div>
  )
}
