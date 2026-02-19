const { test, expect } = require('@playwright/test');

test.describe('Trial Chat Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/trial');
  });

  test('should send message and receive response', async ({ page }) => {
    const messageInput = page.locator('#messageInput');
    const sendBtn = page.locator('#sendBtn');
    
    // Type message
    await messageInput.fill('Hello, this is a test message');
    await sendBtn.click();
    
    // Should see user message
    await expect(page.locator('.message.user')).toBeVisible({ timeout: 5000 });
    
    // Should see AI response
    await expect(page.locator('.message.assistant')).toBeVisible({ timeout: 30000 });
    
    // Message counter should decrease
    await expect(page.locator('text=/[0-4] messages remaining/')).toBeVisible({ timeout: 5000 });
  });

  test('should enforce 5 message limit', async ({ page }) => {
    const messageInput = page.locator('#messageInput');
    const sendBtn = page.locator('#sendBtn');
    
    // Send 5 messages
    for (let i = 0; i < 5; i++) {
      await messageInput.fill(`Test message ${i + 1}`);
      await sendBtn.click();
      
      // Wait for response
      await page.waitForSelector(`.message.assistant:nth-child(${(i + 1) * 2})`, { timeout: 30000 });
    }
    
    // After 5 messages, should show signup prompt
    await expect(page.locator('text=/trial.*complete|sign up|upgrade/')).toBeVisible({ timeout: 5000 });
    
    // Input should be disabled
    await expect(messageInput).toBeDisabled();
  });

  test('should show typing indicator while waiting', async ({ page }) => {
    const messageInput = page.locator('#messageInput');
    const sendBtn = page.locator('#sendBtn');
    
    await messageInput.fill('Tell me a long story');
    await sendBtn.click();
    
    // Should show thinking/typing indicator
    await expect(page.locator('.thinking-indicator, .typing-indicator, text=thinking')).toBeVisible({ timeout: 5000 });
  });

  test('should handle network errors gracefully', async ({ page, context }) => {
    // Simulate offline
    await context.setOffline(true);
    
    const messageInput = page.locator('#messageInput');
    const sendBtn = page.locator('#sendBtn');
    
    await messageInput.fill('Test message');
    await sendBtn.click();
    
    // Should show error message
    await expect(page.locator('text=/error|failed|offline/')).toBeVisible({ timeout: 10000 });
    
    // Go back online
    await context.setOffline(false);
  });

  test('should preserve chat history on refresh', async ({ page }) => {
    const messageInput = page.locator('#messageInput');
    const sendBtn = page.locator('#sendBtn');
    
    // Send a message
    await messageInput.fill('Remember this message');
    await sendBtn.click();
    
    // Wait for response
    await page.waitForSelector('.message.assistant', { timeout: 30000 });
    
    // Refresh page
    await page.reload();
    
    // Chat history should be preserved (if localStorage used)
    const messages = page.locator('.message');
    const count = await messages.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should handle long messages', async ({ page }) => {
    const messageInput = page.locator('#messageInput');
    const sendBtn = page.locator('#sendBtn');
    
    // Send a very long message
    const longMessage = 'This is a test. '.repeat(100);
    await messageInput.fill(longMessage);
    await sendBtn.click();
    
    // Should still send and receive response
    await expect(page.locator('.message.user')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.message.assistant')).toBeVisible({ timeout: 30000 });
  });

  test('should show Grok branding', async ({ page }) => {
    // Should mention Grok somewhere
    await expect(page.locator('text=/Grok|Powered by Grok/')).toBeVisible();
  });
});
