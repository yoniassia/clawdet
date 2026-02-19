const { test, expect } = require('@playwright/test');

test.describe('X OAuth Signup Flow', () => {
  test('should show signup page', async ({ page }) => {
    await page.goto('/signup');
    
    // Should have X OAuth button
    await expect(page.locator('button:has-text("Continue with X"), button:has-text("Sign in with X")')).toBeVisible();
    
    // Should show benefits/features
    await expect(page.locator('text=/free beta|features|benefits/')).toBeVisible();
  });

  test('should redirect to X OAuth when clicked', async ({ page }) => {
    await page.goto('/signup');
    
    // Click X OAuth button
    const oauthBtn = page.locator('button:has-text("Continue with X"), button:has-text("Sign in with X")').first();
    
    // Listen for navigation
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      oauthBtn.click()
    ]);
    
    // Should redirect to X/Twitter OAuth
    await expect(popup).toHaveURL(/twitter\.com|x\.com/);
  });

  test('should show free beta messaging', async ({ page }) => {
    await page.goto('/signup');
    
    // Should mention free beta
    await expect(page.locator('text=/free.*beta|first.*20.*free/i')).toBeVisible();
  });

  test('should show what you get', async ({ page }) => {
    await page.goto('/signup');
    
    // Should list features
    await expect(page.locator('text=/VPS|AI assistant|OpenClaw/i')).toBeVisible();
  });
});

test.describe('Dashboard (Authenticated)', () => {
  test('should require authentication', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login or show auth required
    await expect(page).toHaveURL(/\/(signup|login|auth)/);
  });

  // TODO: Add tests with authenticated session
  // test.use({ storageState: 'auth.json' });
});
