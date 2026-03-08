'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './home.module.css'

export default function Home() {
  const [agentName, setAgentName] = useState('')
  const [personality, setPersonality] = useState('')

  const presets = [
    { emoji: '🤝', name: 'sales-bot', label: 'Sales Agent', desc: 'Qualifies leads, answers product questions', personality: 'You are a friendly sales agent. Qualify leads, answer product questions, and guide customers to the right plan. Be enthusiastic but never pushy.' },
    { emoji: '🎧', name: 'support-agent', label: 'Support Agent', desc: 'Handles customer issues and FAQs', personality: 'You are a patient customer support agent. Help users troubleshoot issues, answer FAQs, and escalate when needed. Always be empathetic and solution-focused.' },
    { emoji: '👨‍💻', name: 'code-reviewer', label: 'Code Reviewer', desc: 'Reviews PRs, suggests improvements', personality: 'You are a senior code reviewer. Review pull requests, suggest improvements, catch bugs, and enforce best practices. Be constructive and specific.' },
    { emoji: '📊', name: 'data-analyst', label: 'Data Analyst', desc: 'Analyzes data, creates reports', personality: 'You are a data analyst. Help interpret data, create visualizations, write SQL queries, and generate reports. Be precise and data-driven.' },
    { emoji: '✍️', name: 'content-writer', label: 'Content Writer', desc: 'Writes blogs, social posts, copy', personality: 'You are a creative content writer. Write engaging blog posts, social media content, and marketing copy. Match the brand voice and optimize for engagement.' },
    { emoji: '🔍', name: 'researcher', label: 'Research Agent', desc: 'Deep research on any topic', personality: 'You are a thorough research agent. Investigate topics deeply, synthesize information from multiple sources, and present findings clearly with citations.' },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Nav */}
        <nav className={styles.header}>
          <div className={styles.logoContainer}>
            <span className={styles.logoIcon}>🐾</span>
            <span className={styles.logoText}>Clawdet</span>
          </div>
          <div className={styles.headerButtons}>
            <Link href="/nanofleets" className={styles.headerLoginButton}>NanoFleets</Link>
            <Link href="/login" className={styles.headerLoginButton}>Log In</Link>
            <Link href="/signup" className={styles.headerSignUpButton}>Get Started</Link>
          </div>
        </nav>

        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroBadge}>
            <span className={styles.badgeDot} />
            Powered by NanoClaw
          </div>
          <h1 className={styles.heroTitle}>
            Deploy AI Agents
            <br />
            <span className={styles.heroGreen}>In Seconds</span>
          </h1>
          <p className={styles.heroDesc}>
            Create a fleet of AI agents — each with its own personality, memory, and channels.
            Connected to Telegram, Slack, WhatsApp, and more. Runs on Docker, costs nearly nothing.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>~2s</span>
              <span className={styles.heroStatLabel}>to deploy</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>32MB</span>
              <span className={styles.heroStatLabel}>per agent</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>$0</span>
              <span className={styles.heroStatLabel}>infra cost</span>
            </div>
          </div>
        </section>

        {/* Quick Create */}
        <section className={styles.createSection}>
          <h2 className={styles.createTitle}>Create Your First Agent</h2>
          <div className={styles.createForm}>
            <div className={styles.createField}>
              <label className={styles.createLabel}>Agent Name</label>
              <input
                className={styles.createInput}
                value={agentName}
                onChange={e => setAgentName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="my-sales-bot"
                maxLength={30}
              />
            </div>
            <div className={styles.createField}>
              <label className={styles.createLabel}>Personality (CLAUDE.md)</label>
              <textarea
                className={styles.createTextarea}
                value={personality}
                onChange={e => setPersonality(e.target.value)}
                placeholder="You are a helpful sales assistant for Acme Corp..."
                rows={3}
              />
            </div>
            <Link 
              href={`/signup?agent=${encodeURIComponent(agentName)}&personality=${encodeURIComponent(personality)}`}
              className={styles.createButton}
            >
              🚀 Deploy Agent — Free
            </Link>
            <p className={styles.createHint}>Sign up to deploy. Free beta — no credit card.</p>
          </div>
        </section>

        {/* Presets */}
        <section className={styles.presetsSection}>
          <h2 className={styles.presetsTitle}>Or Start With a Template</h2>
          <div className={styles.presetsGrid}>
            {presets.map(preset => (
              <button
                key={preset.name}
                className={styles.presetCard}
                onClick={() => { setAgentName(preset.name); setPersonality(preset.personality); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                <span className={styles.presetEmoji}>{preset.emoji}</span>
                <span className={styles.presetLabel}>{preset.label}</span>
                <span className={styles.presetDesc}>{preset.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className={styles.howSection}>
          <h2 className={styles.howTitle}>How It Works</h2>
          <div className={styles.howSteps}>
            <div className={styles.howStep}>
              <div className={styles.howNum}>1</div>
              <h3>Name Your Agent</h3>
              <p>Pick a name and write a personality in plain English. That's your CLAUDE.md — it defines who your agent is.</p>
            </div>
            <div className={styles.howStep}>
              <div className={styles.howNum}>2</div>
              <h3>Deploy in 2 Seconds</h3>
              <p>We spin up a Docker container with your agent. Own workspace, own memory, own API endpoint. Isolated and secure.</p>
            </div>
            <div className={styles.howStep}>
              <div className={styles.howNum}>3</div>
              <h3>Connect Channels</h3>
              <p>Wire up Telegram, Slack, WhatsApp, Discord — or use the REST API. Your agent, everywhere your team is.</p>
            </div>
          </div>
        </section>

        {/* API / MCP */}
        <section className={styles.apiSection}>
          <div className={styles.apiCard}>
            <h2 className={styles.apiTitle}>🔌 REST API + MCP</h2>
            <p className={styles.apiDesc}>Create agents programmatically. Full CRUD via REST or Model Context Protocol.</p>
            <div className={styles.codeBlock}>
              <div className={styles.codeHeader}>
                <span className={styles.codeTab}>REST API</span>
              </div>
              <pre className={styles.code}>{`POST /api/agents
{
  "name": "sales-bot",
  "personality": "You are a sales agent...",
  "model": "claude-sonnet-4-5"
}

→ { "token": "abc123...", "port": 18812 }`}</pre>
            </div>
            <div className={styles.codeBlock}>
              <div className={styles.codeHeader}>
                <span className={styles.codeTab}>MCP (Claude Desktop / Cursor)</span>
              </div>
              <pre className={styles.code}>{`{
  "mcpServers": {
    "clawdet": {
      "url": "https://clawdet.com/api/mcp"
    }
  }
}`}</pre>
            </div>
            <p className={styles.apiTools}>
              8 MCP tools: <code>create_agent</code> · <code>list_agents</code> · <code>chat_with_agent</code> · <code>start_agent</code> · <code>stop_agent</code> · <code>remove_agent</code> · <code>get_agent</code> · <code>fleet_stats</code>
            </p>
          </div>
        </section>

        {/* Fleet Scale */}
        <section className={styles.scaleSection}>
          <h2 className={styles.scaleTitle}>Scale to Fleets</h2>
          <p className={styles.scaleDesc}>Need 5 agents? 50? The architecture is the same.</p>
          <div className={styles.scaleGrid}>
            <div className={styles.scaleCard}>
              <span className={styles.scaleIcon}>🐳</span>
              <h3>Docker Containers</h3>
              <p>Each agent runs in an isolated container. 32MB RAM each. Spin up 100+ on a single server.</p>
            </div>
            <div className={styles.scaleCard}>
              <span className={styles.scaleIcon}>🧠</span>
              <h3>CLAUDE.md Personality</h3>
              <p>Plain text defines who your agent is. Version it in Git. A/B test personalities. No code required.</p>
            </div>
            <div className={styles.scaleCard}>
              <span className={styles.scaleIcon}>📡</span>
              <h3>Multi-Channel</h3>
              <p>Telegram, Slack, WhatsApp, Discord, web chat, REST API. Each agent can connect to any channel.</p>
            </div>
            <div className={styles.scaleCard}>
              <span className={styles.scaleIcon}>🔒</span>
              <h3>Fully Isolated</h3>
              <p>Separate containers, tokens, and workspaces. No agent can access another's data. Enterprise-grade.</p>
            </div>
          </div>
          <div className={styles.scaleCta}>
            <Link href="/nanofleets" className={styles.scaleButton}>
              See NanoFleets for Enterprise →
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>Ready to Deploy?</h2>
          <p className={styles.ctaDesc}>Free beta — first 20 users get unlimited agents. No credit card.</p>
          <div className={styles.ctaButtons}>
            <Link href="/signup" className={styles.headerSignUpButton}>
              Get Started Free
            </Link>
          </div>
        </section>

        <footer className={styles.footer}>
          <div className={styles.footerLinks}>
            <Link href="/nanofleets">NanoFleets</Link>
            <Link href="/admin/fleet">Fleet Dashboard</Link>
            <a href="https://github.com/qwibitai/nanoclaw" target="_blank" rel="noopener">NanoClaw</a>
          </div>
          <p className={styles.footerCopy}>© 2026 Clawdet · Built with NanoClaw</p>
        </footer>
      </div>
    </div>
  )
}
