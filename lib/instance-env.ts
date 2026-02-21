/**
 * Environment variable configuration for customer instances
 * Converts customer data to OpenClaw-compatible env vars
 */

export interface CustomerConfig {
  id: string
  apiKey: string
  gatewayToken: string
  plan: 'free' | 'pro' | 'enterprise'
  model?: string
  features?: {
    telegram?: {
      botToken: string
      dmPolicy?: 'open' | 'pairing' | 'allowlist'
      allowFrom?: string[]
    }
    browser?: boolean
    skills?: string[]
  }
}

/**
 * Generate environment variables for a customer instance
 */
export function generateCustomerEnv(customer: CustomerConfig): Record<string, string> {
  const env: Record<string, string> = {
    // ── Required ─────────────────────────────────────
    ANTHROPIC_API_KEY: customer.apiKey,
    OPENCLAW_GATEWAY_TOKEN: customer.gatewayToken,
    AUTH_PASSWORD: customer.gatewayToken.substring(0, 16),
    AUTH_USERNAME: 'admin',

    // ── Model (tier-based) ───────────────────────────
    OPENCLAW_PRIMARY_MODEL:
      customer.model ||
      (customer.plan === 'enterprise' || customer.plan === 'pro'
        ? 'anthropic/claude-opus-4-5'
        : 'anthropic/claude-sonnet-4-5'),

    // ── Storage ──────────────────────────────────────
    OPENCLAW_STATE_DIR: '/data/.openclaw',
    OPENCLAW_WORKSPACE_DIR: '/data/workspace',

    // ── Gateway ──────────────────────────────────────
    OPENCLAW_GATEWAY_PORT: '18789',
    OPENCLAW_GATEWAY_BIND: 'loopback', // nginx proxies from 8080

    // ── Network ──────────────────────────────────────
    PORT: '8080',
  }

  // ── Telegram (optional) ──────────────────────────
  if (customer.features?.telegram) {
    env.TELEGRAM_BOT_TOKEN = customer.features.telegram.botToken
    env.TELEGRAM_DM_POLICY = customer.features.telegram.dmPolicy || 'pairing'
    
    if (customer.features.telegram.allowFrom) {
      env.TELEGRAM_ALLOW_FROM = customer.features.telegram.allowFrom.join(',')
    }
    
    env.TELEGRAM_REPLY_TO_MODE = 'first'
    env.TELEGRAM_CHUNK_MODE = 'length'
    env.TELEGRAM_TEXT_CHUNK_LIMIT = '4000'
  }

  // ── Browser (optional) ───────────────────────────
  if (customer.features?.browser) {
    env.BROWSER_CDP_URL = 'http://browser:9223'
    env.BROWSER_DEFAULT_PROFILE = 'openclaw'
    env.BROWSER_EVALUATE_ENABLED = 'true'
  }

  // ── Skills (optional) ────────────────────────────
  if (customer.features?.skills && customer.features.skills.length > 0) {
    env.OPENCLAW_INSTALL_SKILLS = customer.features.skills.join(',')
  }

  // ── Resource limits (free tier) ──────────────────
  if (customer.plan === 'free') {
    env.OPENCLAW_MAX_SESSIONS = '5'
    env.OPENCLAW_MAX_WORKSPACE_SIZE = '100MB'
  }

  return env
}

/**
 * Format env vars as .env file content
 */
export function formatEnvFile(env: Record<string, string>, customerId: string, plan: string): string {
  const header = `# Clawdet Customer Environment
# Customer ID: ${customerId}
# Plan: ${plan}
# Generated: ${new Date().toISOString()}

`

  const entries = Object.entries(env)
    .map(([key, value]) => {
      // Escape quotes in values
      const escapedValue = value.replace(/"/g, '\\"')
      // Quote values with spaces
      const quotedValue = value.includes(' ') ? `"${escapedValue}"` : escapedValue
      return `${key}=${quotedValue}`
    })
    .join('\n')

  return header + entries
}

/**
 * Get resource limits for Docker Compose based on plan
 */
export function getResourceLimits(plan: string): {
  cpus: string
  memory: string
} {
  switch (plan) {
    case 'free':
      return { cpus: '0.5', memory: '512M' }
    case 'pro':
      return { cpus: '2', memory: '2G' }
    case 'enterprise':
      return { cpus: '4', memory: '4G' }
    default:
      return { cpus: '1', memory: '1G' }
  }
}

/**
 * Validate customer configuration
 */
export function validateCustomerConfig(customer: CustomerConfig): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!customer.id) errors.push('Customer ID is required')
  if (!customer.apiKey) errors.push('API key is required')
  if (!customer.gatewayToken) errors.push('Gateway token is required')
  if (!['free', 'pro', 'enterprise'].includes(customer.plan)) {
    errors.push('Invalid plan (must be: free, pro, or enterprise)')
  }

  // Validate Telegram config if provided
  if (customer.features?.telegram) {
    if (!customer.features.telegram.botToken) {
      errors.push('Telegram bot token is required when Telegram is enabled')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
