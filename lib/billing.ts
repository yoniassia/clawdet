export type PlanId = "starter" | "growth" | "pro"
export type BillingCycle = "monthly" | "annual"

export interface BillingPlan {
  id: PlanId
  name: string
  tagline: string
  description: string
  monthlyPrice: number
  annualPrice: number
  monthlyPriceId?: string
  annualPriceId?: string
  agents: number
  monthlyTokens: number
  support: string
  highlighted?: boolean
  cta: string
  features: string[]
}

export const BILLING_PLANS: BillingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For solo builders shipping fast",
    description: "1 AI agent, 100K tokens/mo, email support",
    monthlyPrice: 29,
    annualPrice: 290,
    monthlyPriceId: process.env.STRIPE_PRICE_ID_STARTER,
    annualPriceId: process.env.STRIPE_PRICE_ID_STARTER_ANNUAL,
    agents: 1,
    monthlyTokens: 100_000,
    support: "Email support",
    cta: "Start Free Trial",
    features: ["1 AI agent", "100K tokens / month", "Email support", "Fast Stripe checkout"],
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "Best for teams scaling agent workflows",
    description: "5 AI agents, 500K tokens/mo, priority support, custom skills",
    monthlyPrice: 99,
    annualPrice: 990,
    monthlyPriceId: process.env.STRIPE_PRICE_ID_GROWTH,
    annualPriceId: process.env.STRIPE_PRICE_ID_GROWTH_ANNUAL,
    agents: 5,
    monthlyTokens: 500_000,
    support: "Priority support",
    highlighted: true,
    cta: "Subscribe",
    features: ["5 AI agents", "500K tokens / month", "Priority support", "Custom skills"],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Dedicated infrastructure for power users",
    description: "10 AI agents, 2M tokens/mo, dedicated server, white-glove setup",
    monthlyPrice: 299,
    annualPrice: 2990,
    monthlyPriceId: process.env.STRIPE_PRICE_ID_PRO,
    annualPriceId: process.env.STRIPE_PRICE_ID_PRO_ANNUAL,
    agents: 10,
    monthlyTokens: 2_000_000,
    support: "White-glove setup",
    cta: "Subscribe",
    features: ["10 AI agents", "2M tokens / month", "Dedicated server", "White-glove setup"],
  },
]

export function getBillingPlan(planId: string | null | undefined): BillingPlan | undefined {
  return BILLING_PLANS.find((plan) => plan.id === planId)
}

export function getPriceId(planId: string, billingCycle: BillingCycle): string | undefined {
  const plan = getBillingPlan(planId)
  if (!plan) return undefined
  return billingCycle === "annual" ? plan.annualPriceId : plan.monthlyPriceId
}

export function getPlanByPriceId(priceId: string | null | undefined): BillingPlan | undefined {
  if (!priceId) return undefined
  return BILLING_PLANS.find(
    (plan) => plan.monthlyPriceId === priceId || plan.annualPriceId === priceId
  )
}

export function getBillingCycleFromPriceId(priceId: string | null | undefined): BillingCycle {
  const plan = getBillingPlan(getPlanByPriceId(priceId)?.id)
  if (!plan || !priceId) return "monthly"
  return plan.annualPriceId === priceId ? "annual" : "monthly"
}

export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(tokens % 1_000_000 === 0 ? 0 : 1)}M`
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(tokens % 1_000 === 0 ? 0 : 1)}K`
  return `${tokens}`
}

export function getAppUrl(): string {
  return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
}
