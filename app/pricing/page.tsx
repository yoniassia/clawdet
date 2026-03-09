'use client'

import { useMemo, useState } from 'react'
import { BILLING_PLANS, type BillingCycle, formatTokens } from '@/lib/billing'
import styles from './pricing.module.css'

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [error, setError] = useState('')

  const comparisonRows = useMemo(() => ([
    { label: 'AI agents', values: BILLING_PLANS.map((p) => `${p.agents}`) },
    { label: 'Monthly tokens', values: BILLING_PLANS.map((p) => formatTokens(p.monthlyTokens)) },
    { label: 'Support', values: BILLING_PLANS.map((p) => p.support) },
    { label: 'Custom skills', values: ['—', 'Included', 'Included'] },
    { label: 'Dedicated server', values: ['—', '—', 'Included'] },
    { label: 'White-glove setup', values: ['—', '—', 'Included'] },
  ]), [])

  const startCheckout = async (planId: string) => {
    setLoadingPlan(planId)
    setError('')
    try {
      const res = await fetch('/api/payment/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingCycle }),
      })
      const data = await res.json()
      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }
      if (res.status === 401) {
        window.location.href = '/login?next=/pricing'
        return
      }
      setError(data.error || 'Failed to start checkout')
    } catch {
      setError('Failed to start checkout')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <span className={styles.badge}>Stripe billing is live</span>
        <h1>Pick the Clawdet plan that fits your fleet</h1>
        <p>
          Dark-mode pricing, instant Stripe checkout, and a clean path from trial to paid subscription.
        </p>

        <div className={styles.toggleWrap}>
          <button
            className={`${styles.toggleButton} ${billingCycle === 'monthly' ? styles.toggleButtonActive : ''}`}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </button>
          <button
            className={`${styles.toggleButton} ${billingCycle === 'annual' ? styles.toggleButtonActive : ''}`}
            onClick={() => setBillingCycle('annual')}
          >
            Annual <span>2 months free</span>
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.cardGrid}>
        {BILLING_PLANS.map((plan) => {
          const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice
          const monthlyEquivalent = Math.round(plan.annualPrice / 12)
          return (
            <section key={plan.id} className={`${styles.card} ${plan.highlighted ? styles.cardFeatured : ''}`}>
              {plan.highlighted && <div className={styles.popular}>Most Popular</div>}
              <div className={styles.cardHeader}>
                <h2>{plan.name}</h2>
                <p>{plan.tagline}</p>
              </div>

              <div className={styles.priceBlock}>
                <div className={styles.priceLine}>
                  <span className={styles.currency}>$</span>
                  <span className={styles.price}>{price}</span>
                  <span className={styles.period}>/{billingCycle === 'annual' ? 'year' : 'month'}</span>
                </div>
                {billingCycle === 'annual' && <div className={styles.subPrice}>≈ ${monthlyEquivalent}/mo billed annually</div>}
              </div>

              <p className={styles.description}>{plan.description}</p>

              <ul className={styles.featureList}>
                {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>

              <button
                className={`${styles.cta} ${plan.highlighted ? styles.ctaPrimary : styles.ctaSecondary}`}
                onClick={() => startCheckout(plan.id)}
                disabled={loadingPlan === plan.id}
              >
                {loadingPlan === plan.id ? 'Opening checkout…' : plan.cta}
              </button>
            </section>
          )
        })}
      </div>

      <div className={styles.compareCard}>
        <h3>Feature comparison</h3>
        <div className={styles.compareTable}>
          <div className={styles.compareHead}>
            <span>Feature</span>
            {BILLING_PLANS.map((plan) => <span key={plan.id}>{plan.name}</span>)}
          </div>
          {comparisonRows.map((row) => (
            <div key={row.label} className={styles.compareRow}>
              <span>{row.label}</span>
              {row.values.map((value, index) => <span key={`${row.label}-${index}`}>{value}</span>)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
