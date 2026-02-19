const { test, expect } = require('@playwright/test');

// These tests run against a provisioned instance
// Set BASE_URL to test-fresh-1.clawdet.com or similar
test.describe('Instance Chat Interface', () => {
  test.use({ baseURL: process.env.INSTANCE_URL || 'https://test-fresh-1.clawdet.com' });

  test('should load instance landing page', async ({ page }) => {
    await page.goto('/');
    
    // Should show Clawdet branding
    await expect(page.locator('text=Clawdet')).toBeVisible();
    
    // Should have tabs
    await expect(page.locator('button[data-tab="chat"]')).toBeVisible();
    await expect(page.locator('button[data-tab="setup"]')).toBeVisible();
  });

  test('should connect WebSocket', async ({ page }) => {
    await page.goto('/');
    
    // Wait for connection status
    await page.waitForSelector('#statusText', { timeout: 10000 });
    
    // Should show "Connected"
    const statusText = await page.textContent('#statusText');
    expect(statusText).toContain('Connected');
    
    // Status dot should be green (not red)
    const statusDot = page.locator('.status-dot');
    await expect(statusDot).not.toHaveClass(/disconnected/);
  });

  test('should send message and receive response', async ({ page }) => {
    await page.goto('/');
    
    // Wait for connection
    await page.waitForSelector('text=Connected', { timeout: 15000 });
    
    // Type message
    const input = page.locator('#messageInput');
    await input.fill('What model are you using?');
    
    // Send
    await page.locator('#sendBtn').click();
    
    // Should see user message
    await expect(page.locator('.message.user')).toBeVisible({ timeout: 5000 });
    
    // Should see assistant response mentioning Grok
    await expect(page.locator('.message.assistant')).toBeVisible({ timeout: 30000 });
    const responseText = await page.locator('.message.assistant').first().textContent();
    expect(responseText.toLowerCase()).toMatch(/grok|xai/);
  });

  test('should switch to Telegram setup tab', async ({ page }) => {
    await page.goto('/');
    
    // Click setup tab
    await page.click('button[data-tab="setup"]');
    
    // Should show Telegram setup content
    await expect(page.locator('text=@BotFather')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Telegram')).toBeVisible();
  });

  test('should handle WebSocket reconnection', async ({ page, context }) => {
    await page.goto('/');
    
    // Wait for initial connection
    await page.waitForSelector('text=Connected', { timeout: 15000 });
    
    // Simulate network interruption
    await context.setOffline(true);
    
    // Should show disconnected
    await expect(page.locator('text=Disconnected')).toBeVisible({ timeout: 5000 });
    
    // Restore network
    await context.setOffline(false);
    
    // Should reconnect automatically
    await expect(page.locator('text=Connected')).toBeVisible({ timeout: 20000 });
  });

  test('should show correct branding', async ({ page }) => {
    await page.goto('/');
    
    // Should show Clawdet logo/name
    await expect(page.locator('text=Clawdet')).toBeVisible();
    
    // Should show paw emoji or logo
    await expect(page.locator('text=🐾')).toBeVisible();
  });

  test('should have settings button', async ({ page }) => {
    await page.goto('/');
    
    // Should have settings button
    const settingsBtn = page.locator('button:has-text("Settings")');
    await expect(settingsBtn).toBeVisible();
    
    // Clicking should open gateway UI in new tab
    const [newPage] = await Promise.all([
      page.waitForEvent('popup'),
      settingsBtn.click()
    ]);
    
    await expect(newPage).toHaveURL(/\/gateway/);
  });

  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Should load on mobile
    await expect(page.locator('text=Clawdet')).toBeVisible();
    
    // Input should be usable on mobile
    const input = page.locator('#messageInput');
    await expect(input).toBeVisible();
    await expect(input).toBeEditable();
  });

  test('should handle multiple rapid messages', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=Connected', { timeout: 15000 });
    
    const input = page.locator('#messageInput');
    const sendBtn = page.locator('#sendBtn');
    
    // Send 3 messages quickly
    for (let i = 0; i < 3; i++) {
      await input.fill(`Quick message ${i + 1}`);
      await sendBtn.click();
      await page.waitForTimeout(500); // Small delay
    }
    
    // Should handle all messages
    const messages = page.locator('.message.user');
    await expect(messages).toHaveCount(3, { timeout: 10000 });
  });

  test('should support keyboard shortcuts', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=Connected', { timeout: 15000 });
    
    const input = page.locator('#messageInput');
    await input.fill('Test keyboard shortcut');
    
    // Press Enter to send
    await input.press('Enter');
    
    // Should send message
    await expect(page.locator('.message.user')).toBeVisible({ timeout: 5000 });
  });
});
