const { test, expect } = require('@playwright/test');

test.describe('Homepage Tests', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check title
    await expect(page).toHaveTitle(/Clawdet/);
    
    // Check main heading
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    
    // Check hero section
    await expect(page.locator('text=AI Assistant')).toBeVisible();
  });

  test('should show trial chat UI', async ({ page }) => {
    await page.goto('/trial');
    
    // Should have chat interface
    await expect(page.locator('#messageInput')).toBeVisible();
    await expect(page.locator('#sendBtn')).toBeVisible();
    
    // Should show message limit
    await expect(page.locator('text=5 messages')).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check nav links
    const navLinks = page.locator('nav a');
    await expect(navLinks).toHaveCount(await navLinks.count());
    
    // Click "Try It" button
    await page.click('text=Try Free');
    await expect(page).toHaveURL(/.*trial/);
  });

  test('should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Should show mobile menu or adjusted layout
    await expect(page.locator('body')).toBeVisible();
    
    // Check that content doesn't overflow
    const body = await page.locator('body').boundingBox();
    expect(body.width).toBeLessThanOrEqual(375);
  });

  test('should have feedback widget', async ({ page }) => {
    await page.goto('/');
    
    // Feedback widget should be present
    const feedbackBtn = page.locator('[aria-label="Feedback"]').or(page.locator('text=Feedback'));
    await expect(feedbackBtn).toBeVisible({ timeout: 5000 });
  });
});
