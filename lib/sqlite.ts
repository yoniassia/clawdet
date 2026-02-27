import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_PATH = path.join(DATA_DIR, 'clawdet.db')

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (_db) return _db

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  _db = new Database(DB_PATH)
  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')

  // Create tables
  _db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      username TEXT,
      name TEXT,
      password_hash TEXT,
      x_id TEXT UNIQUE,
      x_username TEXT,
      x_name TEXT,
      profile_image TEXT,
      email_verified INTEGER DEFAULT 0,
      role TEXT DEFAULT 'user',
      paid INTEGER DEFAULT 0,
      paid_at TEXT,
      payment_method TEXT,
      subscription_status TEXT DEFAULT 'inactive',
      subscription_plan TEXT,
      terms_accepted INTEGER DEFAULT 0,
      provisioning_status TEXT,
      provisioning_step INTEGER,
      provisioning_step_name TEXT,
      provisioning_progress REAL,
      provisioning_message TEXT,
      provisioning_logs TEXT,
      instance_url TEXT,
      hetzner_vps_id TEXT,
      hetzner_vps_ip TEXT,
      session_token TEXT,
      session_created_at INTEGER,
      disabled INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      provider_account_id TEXT NOT NULL,
      access_token TEXT,
      refresh_token TEXT,
      expires_at INTEGER,
      token_type TEXT,
      scope TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(provider, provider_account_id)
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_x_id ON users(x_id);
    CREATE INDEX IF NOT EXISTS idx_users_session_token ON users(session_token);
    CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
  `)

  return _db
}

export interface DbUser {
  id: string
  email: string | null
  username: string | null
  name: string | null
  password_hash: string | null
  x_id: string | null
  x_username: string | null
  x_name: string | null
  profile_image: string | null
  email_verified: number
  role: string
  paid: number
  paid_at: string | null
  payment_method: string | null
  subscription_status: string | null
  subscription_plan: string | null
  terms_accepted: number
  provisioning_status: string | null
  provisioning_step: number | null
  provisioning_step_name: string | null
  provisioning_progress: number | null
  provisioning_message: string | null
  provisioning_logs: string | null
  instance_url: string | null
  hetzner_vps_id: string | null
  hetzner_vps_ip: string | null
  session_token: string | null
  session_created_at: number | null
  disabled: number
  created_at: number
  updated_at: number
}

// User CRUD operations
export function findUserByEmail(email: string): DbUser | undefined {
  const db = getDb()
  return db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email) as DbUser | undefined
}

export function findUserById(id: string): DbUser | undefined {
  const db = getDb()
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as DbUser | undefined
}

export function findUserByXId(xId: string): DbUser | undefined {
  const db = getDb()
  return db.prepare('SELECT * FROM users WHERE x_id = ?').get(xId) as DbUser | undefined
}

export function findUserByUsername(username: string): DbUser | undefined {
  const db = getDb()
  return db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)').get(username) as DbUser | undefined
}

export function findUserBySessionToken(token: string): DbUser | undefined {
  const db = getDb()
  return db.prepare('SELECT * FROM users WHERE session_token = ?').get(token) as DbUser | undefined
}

export function createUser(data: Partial<DbUser> & { id: string; created_at: number; updated_at: number }): DbUser {
  const db = getDb()
  const columns = Object.keys(data)
  const placeholders = columns.map(() => '?').join(', ')
  const values = columns.map(k => (data as Record<string, unknown>)[k])
  
  db.prepare(`INSERT INTO users (${columns.join(', ')}) VALUES (${placeholders})`).run(...values)
  return findUserById(data.id)!
}

export function updateUserById(id: string, updates: Partial<DbUser>): DbUser | null {
  const db = getDb()
  const entries = Object.entries(updates).filter(([k]) => k !== 'id')
  if (entries.length === 0) return findUserById(id) || null
  
  const setClause = entries.map(([k]) => `${k} = ?`).join(', ')
  const values = entries.map(([, v]) => v)
  
  db.prepare(`UPDATE users SET ${setClause}, updated_at = ? WHERE id = ?`).run(...values, Date.now(), id)
  return findUserById(id) || null
}

export function deleteUserById(id: string): boolean {
  const db = getDb()
  const result = db.prepare('DELETE FROM users WHERE id = ?').run(id)
  return result.changes > 0
}

export function getAllUsers(opts?: { search?: string; limit?: number; offset?: number }): { users: DbUser[]; total: number } {
  const db = getDb()
  const { search, limit = 50, offset = 0 } = opts || {}
  
  let whereClause = ''
  const params: unknown[] = []
  
  if (search) {
    whereClause = 'WHERE username LIKE ? OR email LIKE ? OR name LIKE ? OR x_username LIKE ?'
    const s = `%${search}%`
    params.push(s, s, s, s)
  }
  
  const total = (db.prepare(`SELECT COUNT(*) as count FROM users ${whereClause}`).get(...params) as { count: number }).count
  const users = db.prepare(`SELECT * FROM users ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, limit, offset) as DbUser[]
  
  return { users, total }
}

export function getUserCount(): number {
  const db = getDb()
  return (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count
}

// Account linking
export function linkAccount(data: { user_id: string; provider: string; provider_account_id: string; access_token?: string; refresh_token?: string; expires_at?: number; token_type?: string; scope?: string }) {
  const db = getDb()
  const id = `acc_${Date.now()}_${Math.random().toString(36).substring(7)}`
  db.prepare(`INSERT OR REPLACE INTO accounts (id, user_id, provider, provider_account_id, access_token, refresh_token, expires_at, token_type, scope, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    id, data.user_id, data.provider, data.provider_account_id, data.access_token || null, data.refresh_token || null, data.expires_at || null, data.token_type || null, data.scope || null, Date.now()
  )
}

export function findAccountByProvider(provider: string, providerAccountId: string): { id: string; user_id: string; provider: string; provider_account_id: string } | undefined {
  const db = getDb()
  return db.prepare('SELECT * FROM accounts WHERE provider = ? AND provider_account_id = ?').get(provider, providerAccountId) as any
}

export function getAccountsByUserId(userId: string): Array<{ provider: string; provider_account_id: string }> {
  const db = getDb()
  return db.prepare('SELECT provider, provider_account_id FROM accounts WHERE user_id = ?').all(userId) as any[]
}

export function unlinkAccount(userId: string, provider: string): boolean {
  const db = getDb()
  const result = db.prepare('DELETE FROM accounts WHERE user_id = ? AND provider = ?').run(userId, provider)
  return result.changes > 0
}
