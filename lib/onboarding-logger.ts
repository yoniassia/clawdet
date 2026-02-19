/**
 * Onboarding Logger - Track every signup attempt
 * Logs to: /root/.openclaw/workspace/clawdet/logs/onboarding.log
 */

import { appendFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const LOG_DIR = join(process.cwd(), 'logs')
const LOG_FILE = join(LOG_DIR, 'onboarding.log')

// Ensure logs directory exists
try {
  mkdirSync(LOG_DIR, { recursive: true })
} catch (e) {
  // Directory might already exist
}

export interface OnboardingEvent {
  timestamp: string
  step: 'oauth_start' | 'oauth_callback' | 'details_submit' | 'payment_init' | 'payment_complete' | 'provisioning_start' | 'provisioning_complete' | 'error'
  userId?: string
  username?: string
  email?: string
  success: boolean
  details?: any
  error?: string
}

export function logOnboardingEvent(event: Partial<OnboardingEvent>) {
  const fullEvent: OnboardingEvent = {
    timestamp: new Date().toISOString(),
    step: event.step || 'error',
    success: event.success ?? false,
    ...event
  }

  const logLine = JSON.stringify(fullEvent) + '\n'
  
  try {
    appendFileSync(LOG_FILE, logLine)
    console.log('[ONBOARDING]', fullEvent.step, fullEvent.success ? '✅' : '❌', fullEvent.username || fullEvent.userId || 'unknown')
  } catch (e) {
    console.error('Failed to write onboarding log:', e)
  }
}

export function logOAuthStart(username?: string) {
  logOnboardingEvent({
    step: 'oauth_start',
    username,
    success: true
  })
}

export function logOAuthCallback(success: boolean, userId?: string, username?: string, error?: string) {
  logOnboardingEvent({
    step: 'oauth_callback',
    userId,
    username,
    success,
    error
  })
}

export function logDetailsSubmit(success: boolean, userId: string, email: string, error?: string) {
  logOnboardingEvent({
    step: 'details_submit',
    userId,
    email,
    success,
    error
  })
}

export function logPaymentInit(success: boolean, userId: string, email: string, error?: string) {
  logOnboardingEvent({
    step: 'payment_init',
    userId,
    email,
    success,
    error
  })
}

export function logPaymentComplete(success: boolean, userId: string, email: string, error?: string) {
  logOnboardingEvent({
    step: 'payment_complete',
    userId,
    email,
    success,
    error
  })
}

export function logProvisioningStart(success: boolean, userId: string, username: string, error?: string) {
  logOnboardingEvent({
    step: 'provisioning_start',
    userId,
    username,
    success,
    error
  })
}

export function logProvisioningComplete(success: boolean, userId: string, username: string, subdomain?: string, error?: string) {
  logOnboardingEvent({
    step: 'provisioning_complete',
    userId,
    username,
    success,
    details: { subdomain },
    error
  })
}
