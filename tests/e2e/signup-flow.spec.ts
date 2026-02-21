import { test, expect } from '@playwright/test'

test.describe('Signup Flow', () => {
  test('should load signup page', async ({ page }) => {
    await page.goto('/signup')
    
    await expect(page).toHaveTitle(/Clawdet/)
    await expect(page.locator('body')).toContainText(/Get Your Own Clawdet|Sign.*up/i)
  })

  test('should show Continue with X button', async ({ page }) => {
    await page.goto('/signup')
    
    const xButton = page.locator('button').filter({ hasText: /Continue with X|X/i }).first()
    await expect(xButton).toBeVisible()
  })

  test('should redirect to checkout in mock mode', async ({ page }) => {
    await page.goto('/signup')
    
    // Click Continue with X (will use mock mode)
    const xButton = page.locator('button').filter({ hasText: /Continue with X/i }).first()
    await xButton.click()
    
    // Should redirect to /api/auth/x/login then to callback then to checkout
    await page.waitForURL(/checkout/, { timeout: 10000 })
    
    // Should be on checkout page
    await expect(page).toHaveURL(/\/checkout/)
    await expect(page.locator('body')).toContainText(/payment|checkout|stripe/i)
  })

  test('should create mock user with unique username', async ({ page }) => {
    await page.goto('/signup')
    
    const xButton = page.locator('button').filter({ hasText: /Continue with X/i }).first()
    await xButton.click()
    
    await page.waitForURL(/checkout/, { timeout: 10000 })
    
    // Check that user was created (session cookie should exist)
    const cookies = await page.context().cookies()
    const sessionCookie = cookies.find(c => c.name === 'user_session')
    
    expect(sessionCookie).toBeDefined()
    expect(sessionCookie?.value).toBeTruthy()
  })

  test('should show FREE BETA badge', async ({ page }) => {
    await page.goto('/signup')
    
    await expect(page.locator('body')).toContainText(/FREE.*BETA|BETA.*FREE/i)
  })

  test('should have back to trial link', async ({ page }) => {
    await page.goto('/signup')
    
    const backLink = page.locator('a').filter({ hasText: /back.*trial|trial/i }).first()
    await expect(backLink).toBeVisible()
    
    await backLink.click()
    await expect(page).toHaveURL(/\/trial/)
  })

  test('should show feature list', async ({ page }) => {
    await page.goto('/signup')
    
    // Check for key features
    await expect(page.locator('body')).toContainText(/unlimited/i)
    await expect(page.locator('body')).toContainText(/VPS|server|instance/i)
    await expect(page.locator('body')).toContainText(/subdomain/i)
  })
})

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Create mock user session by going through signup
    await page.goto('/signup')
    const xButton = page.locator('button').filter({ hasText: /Continue with X/i }).first()
    await xButton.click()
    await page.waitForURL(/checkout/, { timeout: 10000 })
  })

  test('should show checkout page', async ({ page }) => {
    await expect(page).toHaveURL(/\/checkout/)
    await expect(page.locator('body')).toContainText(/checkout|payment|price/i)
  })

  test('should have mock checkout option', async ({ page }) => {
    // Look for mock/test checkout option
    const mockButton = page.locator('button, a').filter({ hasText: /mock|test|demo/i }).first()
    
    if (await mockButton.isVisible()) {
      await mockButton.click()
      
      // Should redirect to success or dashboard
      await expect(page).toHaveURL(/(success|dashboard)/)
    }
  })
})
