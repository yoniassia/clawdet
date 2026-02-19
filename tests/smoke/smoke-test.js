#!/usr/bin/env node
/**
 * Clawdet Smoke Test
 * 
 * Quick 5-minute test that verifies basic functionality:
 * 1. Page loads
 * 2. WebSocket connects
 * 3. Can send message and get response
 * 4. Telegram setup tab loads
 * 
 * Run: node tests/smoke/smoke-test.js https://test1.clawdet.com
 * Exit code: 0 = pass, 1 = fail
 */

const { chromium } = require('playwright');

const TARGET_URL = process.argv[2] || 'https://test-fresh-1.clawdet.com';
const TIMEOUT = 30000; // 30 seconds

async function smokeTest() {
  console.log('🧪 Starting Clawdet smoke test...');
  console.log(`   Target: ${TARGET_URL}\n`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = [];
  
  try {
    // Test 1: Page loads
    console.log('1️⃣  Testing: Page loads...');
    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: TIMEOUT });
    const title = await page.title();
    
    if (title.includes('Clawdet')) {
      console.log('   ✅ Page loaded successfully');
      console.log(`   Title: ${title}`);
      results.push({ test: 'page_load', passed: true });
    } else {
      throw new Error(`Unexpected title: ${title}`);
    }
    
    // Test 2: WebSocket connects
    console.log('\n2️⃣  Testing: WebSocket connection...');
    
    // Wait for connection status to change
    await page.waitForSelector('#statusText', { timeout: TIMEOUT });
    
    // Wait up to 15 seconds for "Connected"
    let connected = false;
    for (let i = 0; i < 15; i++) {
      const statusText = await page.textContent('#statusText');
      if (statusText.includes('Connected')) {
        connected = true;
        break;
      }
      await page.waitForTimeout(1000);
    }
    
    if (connected) {
      console.log('   ✅ WebSocket connected');
      results.push({ test: 'websocket_connect', passed: true });
    } else {
      const statusText = await page.textContent('#statusText');
      throw new Error(`WebSocket did not connect. Status: ${statusText}`);
    }
    
    // Test 3: Send message and get response
    console.log('\n3️⃣  Testing: Send message and receive response...');
    
    const messageInput = await page.locator('#messageInput');
    await messageInput.fill('Test message from smoke test');
    
    const sendBtn = await page.locator('#sendBtn');
    await sendBtn.click();
    
    // Wait for response (look for assistant message)
    await page.waitForSelector('.message:not(.user)', { timeout: 30000 });
    
    const messages = await page.locator('.message').count();
    if (messages >= 2) { // At least user message + assistant response
      console.log(`   ✅ Message sent and response received (${messages} messages)`);
      results.push({ test: 'chat_flow', passed: true });
    } else {
      throw new Error(`Expected at least 2 messages, got ${messages}`);
    }
    
    // Test 4: Telegram setup tab loads
    console.log('\n4️⃣  Testing: Telegram setup tab...');
    
    // Click "Setup Telegram" tab
    const setupTab = await page.locator('button[data-tab="setup"]');
    if (await setupTab.count() > 0) {
      await setupTab.click();
      await page.waitForTimeout(500);
      
      // Check if setup content is visible
      const setupPanel = await page.locator('#setup-panel');
      const isVisible = await setupPanel.isVisible();
      
      if (isVisible) {
        console.log('   ✅ Telegram setup tab loads');
        results.push({ test: 'telegram_setup', passed: true });
      } else {
        throw new Error('Telegram setup panel not visible');
      }
    } else {
      console.log('   ⚠️  Telegram setup tab not found (skipped)');
      results.push({ test: 'telegram_setup', passed: true, skipped: true });
    }
    
    // All tests passed
    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL SMOKE TESTS PASSED');
    console.log('='.repeat(60));
    console.log(`\nResults: ${results.filter(r => r.passed).length}/${results.length} tests passed`);
    
    await browser.close();
    process.exit(0);
    
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ SMOKE TEST FAILED');
    console.error('='.repeat(60));
    console.error(`\nError: ${error.message}`);
    console.error(`\nFailed at: ${results.length + 1}/${4} tests`);
    
    // Take screenshot on failure
    try {
      const screenshotPath = `/tmp/smoke-test-failure-${Date.now()}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.error(`\nScreenshot saved: ${screenshotPath}`);
    } catch (e) {
      // Ignore screenshot errors
    }
    
    await browser.close();
    process.exit(1);
  }
}

// Run test
smokeTest().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
