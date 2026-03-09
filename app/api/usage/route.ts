import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { findUserById } from '@/lib/db'
import { getCurrentMonthTokenUsage } from '@/lib/sqlite'
import { getBillingPlan } from '@/lib/billing'
import { SECURITY_HEADERS } from '@/lib/security'

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const user = findUserById(auth.id)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404, headers: SECURITY_HEADERS })
  }

  const plan = getBillingPlan(user.subscriptionPlan || 'starter')
  const tokensUsed = getCurrentMonthTokenUsage(user.id)
  const tokenLimit = plan?.monthlyTokens || 100_000
  const percentUsed = tokenLimit > 0 ? Math.min(100, Math.round((tokensUsed / tokenLimit) * 100)) : 0

  return NextResponse.json({
    planId: plan?.id || 'starter',
    period: new Date().toISOString().slice(0, 7),
    tokensUsed,
    tokenLimit,
    remainingTokens: Math.max(tokenLimit - tokensUsed, 0),
    percentUsed,
  }, { headers: SECURITY_HEADERS })
}
