#!/usr/bin/env tsx
/**
 * Migration script: JSON users -> SQLite
 * Run: npx tsx scripts/migrate-to-sqlite.ts
 */

import fs from 'fs'
import path from 'path'
import { getDb, findUserByEmail, findUserByXId } from '../lib/sqlite'

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json')

interface JsonUser {
  id: string
  xId?: string
  xUsername?: string
  xName?: string
  xProfileImage?: string
  email?: string
  passwordHash?: string
  name?: string
  emailVerified?: boolean
  termsAccepted?: boolean
  paid?: boolean
  paidAt?: string
  paymentMethod?: string
  subscriptionStatus?: string
  subscriptionPlan?: string
  provisioningStatus?: string
  provisioningStep?: number
  provisioningStepName?: string
  provisioningProgress?: number
  provisioningMessage?: string
  provisioningLogs?: Array<{ time: string; msg: string; type: string }>
  instanceUrl?: string
  hetznerVpsId?: string
  hetznerVpsIp?: string
  sessionToken?: string
  sessionCreatedAt?: number
  createdAt: number
  updatedAt: number
}

function migrate() {
  if (!fs.existsSync(USERS_FILE)) {
    console.log('No users.json found, skipping migration')
    return
  }

  const users: JsonUser[] = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'))
  console.log(`Found ${users.length} users to migrate`)

  const db = getDb()
  let migrated = 0
  let skipped = 0

  for (const u of users) {
    // Skip if already exists
    if (u.email && findUserByEmail(u.email)) { skipped++; continue }
    if (u.xId && findUserByXId(u.xId)) { skipped++; continue }

    const stmt = db.prepare(`INSERT INTO users (id, email, username, name, password_hash, x_id, x_username, x_name, profile_image, email_verified, role, paid, paid_at, payment_method, subscription_status, subscription_plan, terms_accepted, provisioning_status, provisioning_step, provisioning_step_name, provisioning_progress, provisioning_message, provisioning_logs, instance_url, hetzner_vps_id, hetzner_vps_ip, session_token, session_created_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)

    stmt.run(
      u.id,
      u.email || null,
      u.xUsername || u.email?.split('@')[0] || null,
      u.name || u.xName || null,
      u.passwordHash || null,
      u.xId || null,
      u.xUsername || null,
      u.xName || null,
      u.xProfileImage || null,
      u.emailVerified ? 1 : 0,
      'user',
      u.paid ? 1 : 0,
      u.paidAt || null,
      u.paymentMethod || null,
      u.subscriptionStatus || 'inactive',
      u.subscriptionPlan || null,
      u.termsAccepted ? 1 : 0,
      u.provisioningStatus || null,
      u.provisioningStep || null,
      u.provisioningStepName || null,
      u.provisioningProgress || null,
      u.provisioningMessage || null,
      u.provisioningLogs ? JSON.stringify(u.provisioningLogs) : null,
      u.instanceUrl || null,
      u.hetznerVpsId || null,
      u.hetznerVpsIp || null,
      u.sessionToken || null,
      u.sessionCreatedAt || null,
      u.createdAt,
      u.updatedAt
    )
    migrated++
  }

  console.log(`Migration complete: ${migrated} migrated, ${skipped} skipped`)
}

migrate()
