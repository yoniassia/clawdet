'use client'

import styles from './signup.module.css'

export default function SignupPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Get Your Own Clawdet</h1>
        <p className={styles.subtitle}>
          🎉 <strong>FREE BETA:</strong> First 20 users get lifetime free access!
        </p>
        
        <div className={styles.card}>
          <div className={styles.price}>
            <span className={styles.betaBadge}>🎁 FREE BETA</span>
            <div className={styles.originalPrice}>
              <span className={styles.strikethrough}>$20/month</span>
              <span className={styles.freePrice}>FREE</span>
            </div>
            <p className={styles.betaNote}>First 20 users only • Limited spots remaining</p>
          </div>
          
          <ul className={styles.features}>
            <li>✅ Unlimited AI conversations</li>
            <li>✅ Your own dedicated VPS instance</li>
            <li>✅ Grok 4.2 AI (xAI)</li>
            <li>✅ Advanced mode enabled</li>
            <li>✅ Tool integrations (browser, cron, files, more)</li>
            <li>✅ Subdomain: username.clawdet.com</li>
            <li>✅ 24/7 availability</li>
            <li>✅ Private & secure</li>
            <li>✅ Lifetime free (beta users)</li>
          </ul>
          
          <button 
            className={styles.xButton}
            onClick={() => window.location.href = '/api/auth/x/login'}
          >
            <svg viewBox="0 0 24 24" className={styles.xIcon}>
              <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Continue with X
          </button>
          
          <p className={styles.note}>
            Test mode: OAuth will use mock authentication for now
          </p>
        </div>
        
        <a href="/trial" className={styles.backLink}>
          ← Back to trial
        </a>
      </div>
    </div>
  )
}
