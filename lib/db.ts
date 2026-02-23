import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

export interface User {
  id: string
  // X OAuth fields (optional for email users)
  xId?: string
  xUsername?: string
  xName?: string
  xProfileImage?: string
  // Email auth fields
  email: string
  passwordHash?: string
  name?: string
  emailVerified?: boolean
  // Common fields
  termsAccepted?: boolean
  paid?: boolean
  paidAt?: string
  paymentMethod?: string
  subscriptionStatus?: 'active' | 'inactive' | 'cancelled'
  subscriptionPlan?: 'free_beta' | 'paid' | 'trial'
  provisioningStatus?: 'pending' | 'creating_vps' | 'configuring_dns' | 'installing' | 'complete' | 'failed'
  provisioningStep?: number
  provisioningStepName?: string
  provisioningProgress?: number
  provisioningMessage?: string
  provisioningLogs?: Array<{ time: string; msg: string; type: 'info' | 'success' | 'error' | 'warn' }>
  instanceUrl?: string
  hetznerVpsId?: string
  hetznerVpsIp?: string
  sessionToken?: string
  sessionCreatedAt?: number
  createdAt: number
  updatedAt: number
}

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// Load all users
export function loadUsers(): User[] {
  ensureDataDir()
  if (!fs.existsSync(USERS_FILE)) {
    return []
  }
  const data = fs.readFileSync(USERS_FILE, 'utf-8')
  return JSON.parse(data)
}

// Get all users (alias for loadUsers)
export function getAllUsers(): User[] {
  return loadUsers()
}

// Get total user count
export function getUserCount(): number {
  const users = loadUsers()
  return users.length
}

// Save all users
function saveUsers(users: User[]) {
  ensureDataDir()
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
}

// Find user by X ID
export function findUserByXId(xId: string): User | undefined {
  const users = loadUsers()
  return users.find(u => u.xId === xId)
}

// Find user by email
export function findUserByEmail(email: string): User | undefined {
  const users = loadUsers()
  return users.find(u => u.email?.toLowerCase() === email.toLowerCase())
}

// Find user by internal ID
export function findUserById(id: string): User | undefined {
  const users = loadUsers()
  return users.find(u => u.id === id)
}

// Find user by session token
export function findUserBySessionToken(sessionToken: string): User | undefined {
  const users = loadUsers()
  return users.find(u => u.sessionToken === sessionToken)
}

// Create or update user (X OAuth)
export function upsertUser(userData: Partial<User> & { xId: string }): User {
  const users = loadUsers()
  const existingIndex = users.findIndex(u => u.xId === userData.xId)
  
  const now = Date.now()
  
  if (existingIndex >= 0) {
    // Update existing user
    users[existingIndex] = {
      ...users[existingIndex],
      ...userData,
      updatedAt: now
    }
    saveUsers(users)
    return users[existingIndex]
  } else {
    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      xId: userData.xId,
      xUsername: userData.xUsername || 'unknown',
      xName: userData.xName || 'Unknown User',
      xProfileImage: userData.xProfileImage,
      email: userData.email || `${userData.xUsername}@x.twitter.com`,
      termsAccepted: userData.termsAccepted || false,
      paid: userData.paid || false,
      provisioningStatus: userData.provisioningStatus,
      instanceUrl: userData.instanceUrl,
      hetznerVpsId: userData.hetznerVpsId,
      hetznerVpsIp: userData.hetznerVpsIp,
      createdAt: now,
      updatedAt: now
    }
    users.push(newUser)
    saveUsers(users)
    return newUser
  }
}

// Create email user
export function createEmailUser(data: {
  email: string
  passwordHash: string
  name: string
}): User {
  const users = loadUsers()
  
  // Check if email already exists
  const existing = users.find(u => u.email?.toLowerCase() === data.email.toLowerCase())
  if (existing) {
    throw new Error('Email already registered')
  }
  
  const now = Date.now()
  const newUser: User = {
    id: `user_${now}_${Math.random().toString(36).substring(7)}`,
    email: data.email,
    passwordHash: data.passwordHash,
    name: data.name,
    emailVerified: false,
    termsAccepted: false,
    paid: false,
    createdAt: now,
    updatedAt: now
  }
  
  users.push(newUser)
  saveUsers(users)
  return newUser
}

// Update user by ID
export function updateUser(id: string, updates: Partial<User>): User | null {
  const users = loadUsers()
  const userIndex = users.findIndex(u => u.id === id)
  
  if (userIndex < 0) {
    return null
  }
  
  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    updatedAt: Date.now()
  }
  
  saveUsers(users)
  return users[userIndex]
}
