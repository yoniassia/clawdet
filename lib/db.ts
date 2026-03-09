/**
 * Database compatibility shim
 * Delegates all operations to sqlite.ts
 */

import {
  findUserByEmail as _findByEmail,
  findUserById as _findById,
  findUserByXId as _findByXId,
  findUserBySessionToken as _findByToken,
  findUserByUsername as _findByUsername,
  findUserByStripeCustomerId as _findByStripeCustomerId,
  findUserByStripeSubscriptionId as _findByStripeSubscriptionId,
  createUser as _createUser,
  updateUserById as _updateById,
  deleteUserById as _deleteById,
  getAllUsers as _getAllUsers,
  getUserCount as _getUserCount,
  type DbUser,
} from './sqlite'

export interface User {
  id: string
  xId?: string
  xUsername?: string
  xName?: string
  xProfileImage?: string
  email: string
  passwordHash?: string
  name?: string
  emailVerified?: boolean
  termsAccepted?: boolean
  paid?: boolean
  paidAt?: string
  paymentMethod?: string
  subscriptionStatus?: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing' | 'unpaid'
  subscriptionPlan?: 'starter' | 'growth' | 'pro' | 'free_beta' | 'paid' | 'trial'
  provisioningStatus?: 'pending' | 'creating_vps' | 'configuring_dns' | 'installing' | 'complete' | 'failed'
  provisioningStep?: number
  provisioningStepName?: string
  provisioningProgress?: number
  provisioningMessage?: string
  provisioningLogs?: Array<{ time: string; msg: string; type: 'info' | 'success' | 'error' | 'warn' }>
  instanceUrl?: string
  hetznerVpsId?: string
  hetznerVpsIp?: string
  coolifyAppUuid?: string
  sessionToken?: string
  sessionCreatedAt?: number
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  stripePriceId?: string
  billingCycle?: 'monthly' | 'annual'
  currentPeriodEnd?: string
  tokensLimit?: number
  role?: string
  createdAt: number
  updatedAt: number
}

function toUser(row: DbUser | undefined): User | undefined {
  if (!row) return undefined
  return {
    id: row.id,
    xId: row.x_id ?? undefined,
    xUsername: row.x_username ?? undefined,
    xName: row.x_name ?? undefined,
    xProfileImage: row.profile_image ?? undefined,
    email: row.email ?? '',
    passwordHash: row.password_hash ?? undefined,
    name: row.name ?? undefined,
    emailVerified: !!row.email_verified,
    termsAccepted: !!row.terms_accepted,
    paid: !!row.paid,
    paidAt: row.paid_at ?? undefined,
    paymentMethod: row.payment_method ?? undefined,
    subscriptionStatus: (row.subscription_status as User['subscriptionStatus']) ?? undefined,
    subscriptionPlan: (row.subscription_plan as User['subscriptionPlan']) ?? undefined,
    provisioningStatus: (row.provisioning_status as User['provisioningStatus']) ?? undefined,
    provisioningStep: row.provisioning_step ?? undefined,
    provisioningStepName: row.provisioning_step_name ?? undefined,
    provisioningProgress: row.provisioning_progress ?? undefined,
    provisioningMessage: row.provisioning_message ?? undefined,
    provisioningLogs: row.provisioning_logs ? JSON.parse(row.provisioning_logs) : undefined,
    instanceUrl: row.instance_url ?? undefined,
    hetznerVpsId: row.hetzner_vps_id ?? undefined,
    hetznerVpsIp: row.hetzner_vps_ip ?? undefined,
    coolifyAppUuid: row.coolify_app_uuid ?? undefined,
    sessionToken: row.session_token ?? undefined,
    sessionCreatedAt: row.session_created_at ?? undefined,
    stripeCustomerId: row.stripe_customer_id ?? undefined,
    stripeSubscriptionId: row.stripe_subscription_id ?? undefined,
    stripePriceId: row.stripe_price_id ?? undefined,
    billingCycle: (row.billing_cycle as User['billingCycle']) ?? undefined,
    currentPeriodEnd: row.current_period_end ?? undefined,
    tokensLimit: row.tokens_limit ?? undefined,
    role: row.role ?? 'user',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toDbUpdates(updates: Partial<User>): Partial<DbUser> {
  const map: Record<string, string> = {
    xId: 'x_id',
    xUsername: 'x_username',
    xName: 'x_name',
    xProfileImage: 'profile_image',
    passwordHash: 'password_hash',
    emailVerified: 'email_verified',
    termsAccepted: 'terms_accepted',
    paidAt: 'paid_at',
    paymentMethod: 'payment_method',
    subscriptionStatus: 'subscription_status',
    subscriptionPlan: 'subscription_plan',
    provisioningStatus: 'provisioning_status',
    provisioningStep: 'provisioning_step',
    provisioningStepName: 'provisioning_step_name',
    provisioningProgress: 'provisioning_progress',
    provisioningMessage: 'provisioning_message',
    provisioningLogs: 'provisioning_logs',
    instanceUrl: 'instance_url',
    hetznerVpsId: 'hetzner_vps_id',
    hetznerVpsIp: 'hetzner_vps_ip',
    coolifyAppUuid: 'coolify_app_uuid',
    sessionToken: 'session_token',
    sessionCreatedAt: 'session_created_at',
    stripeCustomerId: 'stripe_customer_id',
    stripeSubscriptionId: 'stripe_subscription_id',
    stripePriceId: 'stripe_price_id',
    billingCycle: 'billing_cycle',
    currentPeriodEnd: 'current_period_end',
    tokensLimit: 'tokens_limit',
  }

  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(updates)) {
    if (key === 'id' || key === 'createdAt' || key === 'updatedAt') continue
    const dbKey = map[key] || key
    if (typeof value === 'boolean') {
      result[dbKey] = value ? 1 : 0
    } else if (key === 'provisioningLogs' && Array.isArray(value)) {
      result[dbKey] = JSON.stringify(value)
    } else {
      result[dbKey] = value
    }
  }
  return result as Partial<DbUser>
}

export function findUserById(id: string): User | undefined { return toUser(_findById(id)) }
export function findUserByEmail(email: string): User | undefined { return toUser(_findByEmail(email)) }
export function findUserByXId(xId: string): User | undefined { return toUser(_findByXId(xId)) }
export function findUserBySessionToken(token: string): User | undefined { return toUser(_findByToken(token)) }
export function findUserByUsername(username: string): User | undefined { return toUser(_findByUsername(username)) }
export function findUserByStripeCustomerId(customerId: string): User | undefined { return toUser(_findByStripeCustomerId(customerId)) }
export function findUserByStripeSubscriptionId(subscriptionId: string): User | undefined { return toUser(_findByStripeSubscriptionId(subscriptionId)) }

export function getAllUsers(): User[] {
  const { users } = _getAllUsers()
  return users.map(u => toUser(u)!)
}

export function getUserCount(): number { return _getUserCount() }
export function loadUsers(): User[] { return getAllUsers() }

export function upsertUser(userData: Partial<User> & { xId: string }): User {
  const existing = _findByXId(userData.xId)
  const now = Date.now()
  if (existing) {
    const updates = toDbUpdates(userData)
    _updateById(existing.id, updates)
    return toUser(_findById(existing.id))!
  }
  const id = `user_${now}_${Math.random().toString(36).substring(7)}`
  const dbData: Record<string, unknown> = {
    id,
    email: userData.email || `${userData.xUsername}@x.twitter.com`,
    x_id: userData.xId,
    x_username: userData.xUsername || 'unknown',
    x_name: userData.xName || 'Unknown User',
    profile_image: userData.xProfileImage || null,
    terms_accepted: userData.termsAccepted ? 1 : 0,
    paid: userData.paid ? 1 : 0,
    provisioning_status: userData.provisioningStatus || null,
    instance_url: userData.instanceUrl || null,
    hetzner_vps_id: userData.hetznerVpsId || null,
    hetzner_vps_ip: userData.hetznerVpsIp || null,
    stripe_customer_id: userData.stripeCustomerId || null,
    stripe_subscription_id: userData.stripeSubscriptionId || null,
    stripe_price_id: userData.stripePriceId || null,
    billing_cycle: userData.billingCycle || null,
    current_period_end: userData.currentPeriodEnd || null,
    tokens_limit: userData.tokensLimit || null,
    created_at: now,
    updated_at: now,
  }
  _createUser(dbData as any)
  return toUser(_findById(id))!
}

export function createEmailUser(data: { email: string; passwordHash: string; name: string }): User {
  const existing = _findByEmail(data.email)
  if (existing) throw new Error('Email already registered')
  const now = Date.now()
  const id = `user_${now}_${Math.random().toString(36).substring(7)}`
  _createUser({
    id,
    email: data.email,
    password_hash: data.passwordHash,
    name: data.name,
    email_verified: 0,
    terms_accepted: 0,
    paid: 0,
    role: 'user',
    disabled: 0,
    created_at: now,
    updated_at: now,
  } as any)
  return toUser(_findById(id))!
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const dbUpdates = toDbUpdates(updates)
  const result = _updateById(id, dbUpdates)
  return result ? toUser(result) ?? null : null
}

export function deleteUser(id: string): boolean { return _deleteById(id) }
