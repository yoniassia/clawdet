/**
 * Applause QA Configuration
 * Loads from .env.local
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env.local') })

const config = {
  // Applause API Configuration
  apiKey: process.env.APPLAUSE_API_KEY || 'YOUR_API_KEY_HERE',
  productId: process.env.APPLAUSE_PRODUCT_ID || 'YOUR_PRODUCT_ID_HERE',
  autoApiUrl: process.env.APPLAUSE_AUTO_API_URL || 'https://api.applause.com/v1/auto',
  publicApiUrl: process.env.APPLAUSE_PUBLIC_API_URL || 'https://api.applause.com/v1/public',
  
  // Optional Configuration
  testCycleId: process.env.APPLAUSE_TEST_CYCLE_ID || null,
  webhookSecret: process.env.APPLAUSE_WEBHOOK_SECRET || null,
  
  // GitHub Integration
  githubToken: process.env.GITHUB_TOKEN || process.env.GH_TOKEN,
  githubRepo: process.env.GITHUB_REPO || 'yoniassia/clawdet',
  
  // Telegram Notifications
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || null,
  telegramChatId: process.env.TELEGRAM_CHAT_ID || null,
  
  // Test Configuration
  defaultBrowsers: ['chrome', 'firefox', 'safari'],
  defaultDevices: ['desktop', 'mobile'],
  defaultTestDuration: 24, // hours
  
  // Polling Configuration (if webhooks not available)
  pollingInterval: 30 * 60 * 1000, // 30 minutes
  maxPollingAttempts: 96, // 48 hours / 30 min = 96 attempts
}

// Validation
function validateConfig() {
  const errors = []
  
  if (config.apiKey === 'YOUR_API_KEY_HERE' || !config.apiKey) {
    errors.push('APPLAUSE_API_KEY not configured')
  }
  
  if (config.productId === 'YOUR_PRODUCT_ID_HERE' || !config.productId) {
    errors.push('APPLAUSE_PRODUCT_ID not configured')
  }
  
  if (!config.githubToken) {
    errors.push('GITHUB_TOKEN not configured (needed for issue creation)')
  }
  
  return errors
}

function isConfigured() {
  return validateConfig().length === 0
}

module.exports = {
  config,
  validateConfig,
  isConfigured
}
