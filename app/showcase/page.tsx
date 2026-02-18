'use client';

import { useState, useEffect } from 'react';
import styles from './showcase.module.css';

interface FeatureDemo {
  id: string;
  icon: string;
  title: string;
  description: string;
  example: string;
}

const features: FeatureDemo[] = [
  {
    id: 'browser',
    icon: '🌐',
    title: 'Browser Automation',
    description: 'Control websites, fill forms, scrape data',
    example: 'Search Google, take screenshots, extract content'
  },
  {
    id: 'cron',
    icon: '📅',
    title: 'Cron Jobs & Scheduling',
    description: 'Set reminders, automate recurring tasks',
    example: 'Daily email summaries, weekly reports'
  },
  {
    id: 'subagents',
    icon: '🤖',
    title: 'Sub-Agents',
    description: 'Spawn isolated AI workers for complex tasks',
    example: 'Research agents, data analysis, parallel processing'
  },
  {
    id: 'memory',
    icon: '🧠',
    title: 'Memory System',
    description: 'Semantic search across all your notes and docs',
    example: 'Automatic context retrieval, long-term memory'
  },
  {
    id: 'code',
    icon: '💻',
    title: 'Code Generation',
    description: 'Write, debug, and execute code in any language',
    example: 'Python, JavaScript, TypeScript, Bash, Go, Rust'
  },
  {
    id: 'files',
    icon: '📁',
    title: 'File Management',
    description: 'Read, write, and organize files in your workspace',
    example: 'Create projects, edit configs, search documents'
  },
  {
    id: 'research',
    icon: '🔍',
    title: 'Research Tools',
    description: 'Search the web, fetch articles, create summaries',
    example: 'Brave Search API, web scraping, content extraction'
  },
  {
    id: 'canvas',
    icon: '🎨',
    title: 'Canvas UI',
    description: 'Render charts, diagrams, and visual content',
    example: 'Bar charts, flowcharts, interactive widgets'
  },
  {
    id: 'human',
    icon: '👤',
    title: 'RentAHuman',
    description: 'Human-in-the-loop assistance for complex decisions',
    example: 'Ethical dilemmas, creative judgments, safety checks'
  }
];

export default function ShowcasePage() {
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [instanceStatus, setInstanceStatus] = useState<'loading' | 'online' | 'error'>('loading');

  useEffect(() => {
    // Check instance status
    fetch('/api/showcase/status')
      .then(res => res.ok ? setInstanceStatus('online') : setInstanceStatus('error'))
      .catch(() => setInstanceStatus('error'));
  }, []);

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            🦞 Your OpenClaw Instance
          </h1>
          <p className={styles.heroSubtitle}>
            Advanced AI assistant with full tool integration
          </p>
          <div className={styles.statusBadge}>
            {instanceStatus === 'loading' && <span className={styles.statusLoading}>⏳ Checking status...</span>}
            {instanceStatus === 'online' && <span className={styles.statusOnline}>🟢 Running</span>}
            {instanceStatus === 'error' && <span className={styles.statusError}>🔴 Offline</span>}
          </div>
          <div className={styles.heroActions}>
            <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
              📱 Connect Telegram
            </a>
            <a href="/docs" className={styles.btnSecondary}>
              📚 View Docs
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Explore OpenClaw Features</h2>
        <p className={styles.sectionSubtitle}>
          Click any card to learn more about what your AI assistant can do
        </p>
        
        <div className={styles.featureGrid}>
          {features.map(feature => (
            <div
              key={feature.id}
              className={`${styles.featureCard} ${expandedFeature === feature.id ? styles.expanded : ''}`}
              onClick={() => setExpandedFeature(expandedFeature === feature.id ? null : feature.id)}
            >
              <div className={styles.featureHeader}>
                <span className={styles.featureIcon}>{feature.icon}</span>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
              </div>
              <p className={styles.featureDescription}>{feature.description}</p>
              
              {expandedFeature === feature.id && (
                <div className={styles.featureDetails}>
                  <p className={styles.featureExample}>
                    <strong>Example uses:</strong><br />
                    {feature.example}
                  </p>
                  <div className={styles.featureActions}>
                    <button className={styles.btnDemo} disabled>
                      Try Demo (Coming Soon)
                    </button>
                    <a href="/docs" className={styles.btnLearnMore}>
                      Learn More →
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Quick Start */}
      <section className={styles.quickStart}>
        <h2 className={styles.sectionTitle}>Get Started in 3 Steps</h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h3>Connect Your Bot</h3>
            <p>Create a Telegram bot via @BotFather and configure it in your OpenClaw settings</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <h3>Try Your First Command</h3>
            <p>Send a message like "What can you do?" or "Help me with a task"</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h3>Explore Advanced Features</h3>
            <p>Use cron jobs, spawn sub-agents, automate browser tasks, and more</p>
          </div>
        </div>
      </section>

      {/* System Info */}
      <section className={styles.systemInfo}>
        <h2 className={styles.sectionTitle}>Instance Information</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3>🔧 Configuration</h3>
            <ul>
              <li>Model: Grok 4.2 (xAI)</li>
              <li>Mode: Advanced (all tools enabled)</li>
              <li>Workspace: /root/.openclaw/workspace</li>
            </ul>
          </div>
          <div className={styles.infoCard}>
            <h3>🛠️ Enabled Tools</h3>
            <ul>
              <li>Browser automation</li>
              <li>Cron jobs & scheduling</li>
              <li>Sub-agent spawning</li>
              <li>Memory search</li>
              <li>Code execution</li>
              <li>File management</li>
            </ul>
          </div>
          <div className={styles.infoCard}>
            <h3>📚 Resources</h3>
            <ul>
              <li><a href="/docs">User Documentation</a></li>
              <li><a href="https://docs.openclaw.ai" target="_blank" rel="noopener noreferrer">Official Docs</a></li>
              <li><a href="https://discord.com/invite/clawd" target="_blank" rel="noopener noreferrer">Community Discord</a></li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>Powered by <a href="https://clawdet.com">ClawDet</a> • OpenClaw Beta</p>
        <p>
          <a href="/feedback">Send Feedback</a> • 
          <a href="mailto:support@clawdet.com">Support</a>
        </p>
      </footer>
    </div>
  );
}
