'use client'

import styles from './signup.module.css'

export default function SignupPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Get Your Own Clawdet</h1>
        <p className={styles.subtitle}>
          Sign up with X (Twitter) to get started
        </p>
        
        <div className={styles.card}>
          <div className={styles.price}>
            <span className={styles.currency}>$</span>
            <span className={styles.amount}>20</span>
            <span className={styles.period}>/month</span>
          </div>
          
          <ul className={styles.features}>
            <li>✅ Unlimited AI conversations</li>
            <li>✅ Your own dedicated instance</li>
            <li>✅ Tool integrations (X, GitHub, etc.)</li>
            <li>✅ 24/7 availability</li>
            <li>✅ Private & secure</li>
            <li>✅ Cancel anytime</li>
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
