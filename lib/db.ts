import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

export interface User {
  id: string
  xId: string
  xUsername: string
  xName: string
  xProfileImage?: string
  email?: string
  termsAccepted?: boolean
  paid?: boolean
  provisioningStatus?: 'pending' | 'creating_vps' | 'configuring_dns' | 'installing' | 'complete' | 'failed'
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

// Create or update user
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
      email: userData.email,
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
