import { describe, it, expect, beforeEach } from 'vitest'
import { generateSessionToken, checkRateLimit, getClientIP } from '../security'

describe('Security Functions', () => {
  describe('generateSessionToken', () => {
    it('should generate a 32-byte hex token', () => {
      const token = generateSessionToken()
      expect(token).toHaveLength(64) // 32 bytes = 64 hex chars
      expect(token).toMatch(/^[0-9a-f]{64}$/)
    })

    it('should generate unique tokens', () => {
      const token1 = generateSessionToken()
      const token2 = generateSessionToken()
      expect(token1).not.toBe(token2)
    })
  })

  describe('checkRateLimit', () => {
    beforeEach(() => {
      // Clear rate limit store before each test
      // (In production, you'd need to expose a clear method)
    })

    it('should allow requests under the limit', () => {
      const result = checkRateLimit('test-key', { maxRequests: 5, windowMs: 60000 })
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)
    })

    it('should block requests over the limit', () => {
      const key = 'test-limit'
      const options = { maxRequests: 2, windowMs: 60000 }
      
      // First two should pass
      expect(checkRateLimit(key, options).allowed).toBe(true)
      expect(checkRateLimit(key, options).allowed).toBe(true)
      
      // Third should fail
      const blocked = checkRateLimit(key, options)
      expect(blocked.allowed).toBe(false)
      expect(blocked.remaining).toBe(0)
    })

    it('should reset after time window', async () => {
      const key = 'test-reset'
      const options = { maxRequests: 2, windowMs: 100 } // 100ms window
      
      // Use up limit
      checkRateLimit(key, options)
      checkRateLimit(key, options)
      expect(checkRateLimit(key, options).allowed).toBe(false)
      
      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150))
      
      // Should allow again
      expect(checkRateLimit(key, options).allowed).toBe(true)
    })
  })

  describe('getClientIP', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const headers = new Headers()
      headers.set('x-forwarded-for', '192.168.1.1, 10.0.0.1')
      
      const ip = getClientIP(headers)
      expect(ip).toBe('192.168.1.1')
    })

    it('should extract IP from x-real-ip header', () => {
      const headers = new Headers()
      headers.set('x-real-ip', '192.168.1.2')
      
      const ip = getClientIP(headers)
      expect(ip).toBe('192.168.1.2')
    })

    it('should return unknown if no IP headers', () => {
      const headers = new Headers()
      
      const ip = getClientIP(headers)
      expect(ip).toBe('unknown')
    })
  })
})
