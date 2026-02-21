// Test setup file
// Runs before all tests

// Load environment variables for tests
import { config } from 'dotenv'
config({ path: '.env.local' })

// Mock environment variables if not set
process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'test_key'
process.env.NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

// Global test timeout
const DEFAULT_TIMEOUT = 10000
globalThis.setTimeout(() => {}, DEFAULT_TIMEOUT)
