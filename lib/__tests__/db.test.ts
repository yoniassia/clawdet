import { describe, it, expect, beforeEach } from 'vitest'
import { upsertUser, findUserById, updateUser, findUserByXId, User } from '../db'

describe('Database Functions', () => {
  describe('upsertUser', () => {
    it('should create a new user', () => {
      const userData = {
        xId: 'test_123',
        xUsername: 'testuser',
        xName: 'Test User'
      }
      
      const user = upsertUser(userData)
      
      expect(user).toBeDefined()
      expect(user.id).toBeDefined()
      expect(user.xId).toBe('test_123')
      expect(user.xUsername).toBe('testuser')
      expect(user.xName).toBe('Test User')
      expect(user.createdAt).toBeDefined()
      expect(user.updatedAt).toBeDefined()
    })

    it('should update existing user when xId matches', () => {
      // Create user
      const user1 = upsertUser({
        xId: 'test_456',
        xUsername: 'user1',
        xName: 'Original Name'
      })
      
      // Update same user
      const user2 = upsertUser({
        xId: 'test_456',
        xUsername: 'user1',
        xName: 'Updated Name'
      })
      
      expect(user1.id).toBe(user2.id)
      expect(user2.xName).toBe('Updated Name')
    })

    it('should auto-generate timestamps', () => {
      const user = upsertUser({
        xId: 'test_789',
        xUsername: 'timetest',
        xName: 'Time Test'
      })
      
      expect(user.createdAt).toBeGreaterThan(0)
      expect(user.updatedAt).toBeGreaterThan(0)
      expect(user.updatedAt).toBeGreaterThanOrEqual(user.createdAt)
    })
  })

  describe('findUserById', () => {
    it('should find user by ID', () => {
      const created = upsertUser({
        xId: 'test_find1',
        xUsername: 'findme',
        xName: 'Find Me'
      })
      
      const found = findUserById(created.id)
      
      expect(found).toBeDefined()
      expect(found?.id).toBe(created.id)
      expect(found?.xUsername).toBe('findme')
    })

    it('should return undefined for non-existent ID', () => {
      const found = findUserById('nonexistent_id_12345')
      expect(found).toBeUndefined()
    })
  })

  describe('updateUser', () => {
    it('should update user fields', () => {
      const user = upsertUser({
        xId: 'test_update1',
        xUsername: 'updateme',
        xName: 'Update Me'
      })
      
      const updated = updateUser(user.id, {
        email: 'test@example.com',
        paid: true
      })
      
      expect(updated?.email).toBe('test@example.com')
      expect(updated?.paid).toBe(true)
      expect(updated?.xUsername).toBe('updateme') // Unchanged fields preserved
    })

    it('should update timestamps on update', () => {
      const user = upsertUser({
        xId: 'test_timestamp',
        xUsername: 'timestamptest',
        xName: 'Timestamp Test'
      })
      
      const originalUpdatedAt = user.updatedAt
      
      // Wait a tiny bit
      const now = Date.now()
      while (Date.now() === now) {} // Busy wait for 1ms
      
      const updated = updateUser(user.id, { email: 'new@example.com' })
      
      expect(updated?.updatedAt).toBeGreaterThan(originalUpdatedAt)
    })

    it('should return null for non-existent user', () => {
      const result = updateUser('nonexistent_999', { email: 'test@test.com' })
      expect(result).toBeNull()
    })
  })

  describe('findUserByXId', () => {
    it('should find user by X ID', () => {
      upsertUser({
        xId: 'test_xid_find',
        xUsername: 'coolhandle',
        xName: 'Cool User'
      })
      
      const found = findUserByXId('test_xid_find')
      
      expect(found).toBeDefined()
      expect(found?.xId).toBe('test_xid_find')
      expect(found?.xUsername).toBe('coolhandle')
      expect(found?.xName).toBe('Cool User')
    })

    it('should return undefined for non-existent X ID', () => {
      const found = findUserByXId('doesnotexist_xid')
      expect(found).toBeUndefined()
    })
  })

  describe('Provisioning fields', () => {
    it('should store provisioning status', () => {
      const user = upsertUser({
        xId: 'test_prov1',
        xUsername: 'provtest',
        xName: 'Prov Test',
        provisioningStatus: 'pending'
      })
      
      expect(user.provisioningStatus).toBe('pending')
      
      // Update status
      const updated = updateUser(user.id, {
        provisioningStatus: 'creating_vps'
      })
      
      expect(updated?.provisioningStatus).toBe('creating_vps')
    })

    it('should store instance details', () => {
      const user = upsertUser({
        xId: 'test_instance',
        xUsername: 'instanceuser',
        xName: 'Instance User'
      })
      
      const updated = updateUser(user.id, {
        instanceUrl: 'instanceuser.clawdet.com',
        hetznerVpsId: '12345',
        hetznerVpsIp: '192.168.1.100',
        provisioningStatus: 'complete'
      })
      
      expect(updated?.instanceUrl).toBe('instanceuser.clawdet.com')
      expect(updated?.hetznerVpsId).toBe('12345')
      expect(updated?.hetznerVpsIp).toBe('192.168.1.100')
      expect(updated?.provisioningStatus).toBe('complete')
    })
  })

  describe('Mock OAuth users', () => {
    it('should handle mock user creation', () => {
      const timestamp = Date.now()
      const user = upsertUser({
        xId: `mock_${timestamp}`,
        xUsername: `testuser${Math.floor(timestamp / 1000)}`,
        xName: 'Test User',
        email: `testuser${Math.floor(timestamp / 1000)}@test.clawdet.com`,
        termsAccepted: true
      })
      
      expect(user.xId).toContain('mock_')
      expect(user.email).toContain('@test.clawdet.com')
      expect(user.termsAccepted).toBe(true)
    })
  })
})
