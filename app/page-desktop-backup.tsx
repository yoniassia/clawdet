import Link from 'next/link'
import styles from './home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          🐾 <span className={styles.gradient}>Clawdet</span>
        </h1>
        <p className={styles.subtitle}>
          Your Personal AI Companion, Always by Your Side
        </p>
        <p className={styles.description}>
          Get your own OpenClaw instance with unlimited AI conversations,
          tool integrations, and 24/7 availability.
        </p>
        <div className={styles.cta}>
          <Link href="/trial" className={styles.primaryButton}>
            Try It Free
          </Link>
          <Link href="/signup" className={styles.secondaryButton}>
            Get Started
          </Link>
        </div>
        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>💬</div>
            <h3>Unlimited Chat</h3>
            <p>Never run out of messages</p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🔧</div>
            <h3>Tool Integration</h3>
            <p>Connect to your workflow</p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🚀</div>
            <h3>Your Own Instance</h3>
            <p>Private, dedicated server</p>
          </div>
        </div>
      </div>
    </div>
  )
}
