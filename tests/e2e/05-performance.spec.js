const { test, expect } = require('@playwright/test');

test.describe('Performance Tests', () => {
  test('homepage should load quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // Should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    console.log(`Homepage load time: ${loadTime}ms`);
  });

  test('trial page should load quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/trial');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    console.log(`Trial page load time: ${loadTime}ms`);
  });

  test('should not have console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Should have no console errors
    expect(errors.length).toBe(0);
  });

  test('should not have memory leaks', async ({ page }) => {
    await page.goto('/trial');
    
    const initialMetrics = await page.metrics();
    
    // Interact with page (send messages)
    for (let i = 0; i < 5; i++) {
      await page.fill('#messageInput', `Message ${i}`);
      await page.click('#sendBtn');
      await page.waitForTimeout(2000);
    }
    
    const finalMetrics = await page.metrics();
    
    // Memory should not grow excessively
    const memoryGrowth = finalMetrics.JSHeapUsedSize - initialMetrics.JSHeapUsedSize;
    expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); // < 50MB growth
    
    console.log(`Memory growth: ${(memoryGrowth / 1024 / 1024).toFixed(2)}MB`);
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    
    // Measure Largest Contentful Paint (LCP)
    const lcp = await page.evaluate(() => {
      return new Promise(resolve => {
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.renderTime || lastEntry.loadTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        
        // Timeout after 10 seconds
        setTimeout(() => resolve(0), 10000);
      });
    });
    
    // LCP should be < 2.5 seconds (good)
    expect(lcp).toBeLessThan(2500);
    console.log(`LCP: ${lcp.toFixed(0)}ms`);
  });
});

test.describe('Accessibility Tests', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    
    // Check for ARIA landmarks
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();
    
    // Buttons should have accessible names
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      
      // Button should have either aria-label or text content
      expect(ariaLabel || text).toBeTruthy();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/trial');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should focus on input
    const focused = await page.evaluate(() => document.activeElement.id);
    expect(focused).toBeTruthy();
  });

  test('should have good color contrast', async ({ page }) => {
    await page.goto('/');
    
    // Check that text is visible against background
    const body = page.locator('body');
    const bgColor = await body.evaluate(el => getComputedStyle(el).backgroundColor);
    const color = await body.evaluate(el => getComputedStyle(el).color);
    
    // Should have contrasting colors (not the same)
    expect(bgColor).not.toBe(color);
  });
});
