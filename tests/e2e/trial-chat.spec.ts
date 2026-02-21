import { test, expect } from '@playwright/test'

test.describe('Trial Chat Flow', () => {
  test('should load trial page and show welcome message', async ({ page }) => {
    await page.goto('/trial')
    
    // Check page loaded
    await expect(page).toHaveTitle(/Clawdet/)
    
    // Check welcome/intro text exists
    await expect(page.locator('body')).toContainText(/5.*free.*message/i)
  })

  test('should send message and receive AI response', async ({ page }) => {
    await page.goto('/trial')
    
    // Find input and button
    const input = page.locator('input[type="text"]').first()
    const sendButton = page.locator('button').filter({ hasText: /send/i }).first()
    
    // Send first message
    await input.fill('Hello, test message')
    await sendButton.click()
    
    // Wait for response (max 10 seconds)
    await page.waitForSelector('.message', { timeout: 10000 })
    
    // Check user message appears
    await expect(page.locator('.message').filter({ hasText: 'Hello, test message' })).toBeVisible()
    
    // Check AI response appears (should contain some response text)
    const messages = page.locator('.message')
    await expect(messages).toHaveCount(2) // User + AI
  })

  test('should track message count correctly', async ({ page }) => {
    await page.goto('/trial')
    
    const input = page.locator('input[type="text"]').first()
    const sendButton = page.locator('button').filter({ hasText: /send/i }).first()
    
    // Send first message
    await input.fill('Message 1')
    await sendButton.click()
    await page.waitForTimeout(2000)
    
    // Counter should show 4 remaining
    await expect(page.locator('body')).toContainText(/4.*remaining/i)
  })

  test('should show limit reached after 5 messages', async ({ page }) => {
    await page.goto('/trial')
    
    const input = page.locator('input[type="text"]').first()
    const sendButton = page.locator('button').filter({ hasText: /send/i }).first()
    
    // Send 5 messages
    for (let i = 1; i <= 5; i++) {
      await input.fill(`Test message ${i}`)
      await sendButton.click()
      await page.waitForTimeout(2000) // Wait for response
    }
    
    // Should show limit reached message or modal
    await expect(page.locator('body')).toContainText(/limit.*reached|upgrade|sign.*up/i)
    
    // Input should be disabled or hidden
    const inputAfter = page.locator('input[type="text"]').first()
    await expect(inputAfter).toBeDisabled()
  })

  test('should have working signup CTA when limit reached', async ({ page }) => {
    await page.goto('/trial')
    
    // Fast-forward to limit by using sessionStorage
    await page.evaluate(() => {
      sessionStorage.setItem('trialMessageCount', '5')
    })
    
    await page.reload()
    
    // Should show signup button
    const signupButton = page.locator('a, button').filter({ hasText: /get.*started|sign.*up/i }).first()
    await expect(signupButton).toBeVisible()
    
    // Click should navigate to signup
    await signupButton.click()
    await expect(page).toHaveURL(/\/signup/)
  })

  test('should persist messages in sessionStorage', async ({ page }) => {
    await page.goto('/trial')
    
    const input = page.locator('input[type="text"]').first()
    const sendButton = page.locator('button').filter({ hasText: /send/i }).first()
    
    // Send a message
    await input.fill('Persistence test')
    await sendButton.click()
    await page.waitForTimeout(2000)
    
    // Check sessionStorage
    const storedCount = await page.evaluate(() => sessionStorage.getItem('trialMessageCount'))
    expect(storedCount).toBe('1')
    
    // Reload page
    await page.reload()
    
    // Message should still be there
    await expect(page.locator('.message').filter({ hasText: 'Persistence test' })).toBeVisible()
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API and force error
    await page.route('**/api/trial-chat', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Test error' })
      })
    })
    
    await page.goto('/trial')
    
    const input = page.locator('input[type="text"]').first()
    const sendButton = page.locator('button').filter({ hasText: /send/i }).first()
    
    await input.fill('This will error')
    await sendButton.click()
    
    // Should show fallback/error message
    await expect(page.locator('.message')).toContainText(/trouble|error|try.*again/i)
  })

  test('should prevent empty messages', async ({ page }) => {
    await page.goto('/trial')
    
    const sendButton = page.locator('button').filter({ hasText: /send/i }).first()
    
    // Button should be disabled when input is empty
    await expect(sendButton).toBeDisabled()
    
    // Fill with spaces only
    const input = page.locator('input[type="text"]').first()
    await input.fill('   ')
    
    // Should still be disabled
    await expect(sendButton).toBeDisabled()
  })
})
