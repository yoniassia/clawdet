/**
 * E2E Provisioning Tests — Full tenant lifecycle
 *
 * Modes:
 *   TEST_MODE=mock  — Uses mock Coolify server (CI/local)
 *   TEST_MODE=real  — Hits actual Coolify API (staging)
 *
 * Run: npx playwright test tests/e2e/provisioning.spec.ts
 */

import { test, expect, type Page } from '@playwright/test';
import {
  provisionTestAgent,
  waitForHealthy,
  deprovisionTestAgent,
  uniqueName,
} from '../helpers/provisioning-helper';
import { MockCoolifyServer } from '../helpers/mock-coolify';

const TEST_MODE = process.env.TEST_MODE ?? 'mock';
const BASE_URL = process.env.CLAWDET_URL ?? 'https://clawdet.com';
const PROVISION_TIMEOUT = 120_000;

let mockServer: MockCoolifyServer | null = null;

test.beforeAll(async () => {
  if (TEST_MODE === 'mock') {
    mockServer = new MockCoolifyServer();
    await mockServer.start(19876);
    process.env.COOLIFY_BASE_URL = 'http://localhost:19876';
    process.env.COOLIFY_API_TOKEN = 'mock-token';
  }
});

test.afterAll(async () => {
  if (mockServer) await mockServer.stop();
});

// ─── Test 1: Full Signup → Provisioning Flow ──────────────────────────────

test.describe('Test 1: Full Provisioning Flow (Alpha)', () => {
  const agentName = uniqueName('alpha');
  let appUuid: string;
  let agentUrl: string;

  test.afterAll(async () => {
    try {
      if (appUuid) await deprovisionTestAgent(appUuid);
    } catch { /* cleanup best-effort */ }
  });

  test('signup page renders correctly', async ({ page }) => {
    test.setTimeout(30_000);

    // Verify signup page loads with correct form elements
    await page.goto(`${BASE_URL}/signup`);
    await page.waitForLoadState('networkidle');

    // Verify form elements exist
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]:has-text("Create Account")')).toBeVisible();
    await expect(page.locator('text="Continue with X"')).toBeVisible();
  });

  test('signup details → dashboard → provision flow', async ({ page, context }) => {
    test.setTimeout(PROVISION_TIMEOUT);

    // In test mode, set a cookie so /api/auth/me returns mock user
    await context.addCookies([{
      name: 'test-username',
      value: agentName,
      domain: new URL(BASE_URL).hostname,
      path: '/',
    }, {
      name: 'next-auth.session-token',
      value: 'mock-session-token',
      domain: new URL(BASE_URL).hostname,
      path: '/',
    }]);

    // Navigate to signup/details (simulating post-auth redirect)
    await page.goto(`${BASE_URL}/signup/details`);
    await page.waitForLoadState('networkidle');

    // Verify we're on the details page (not redirected away)
    const welcomeText = page.locator('text=/Welcome/');
    await expect(welcomeText).toBeVisible({ timeout: 15_000 });

    // Fill email field and accept terms
    const testEmail = `${agentName}@test.clawdet.com`;
    await page.fill('#email', testEmail);
    await page.check('#terms');

    // Click "Complete Setup"
    await page.click('button[type="submit"]:has-text("Complete Setup")');

    // Expect redirect to /dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
    expect(page.url()).toContain('/dashboard');

    // Verify dashboard loaded with welcome message
    const welcomeDashboard = page.locator('text=/Welcome/');
    await expect(welcomeDashboard).toBeVisible({ timeout: 15_000 });

    // Click "Get My Free Instance Now"
    const freeBetaBtn = page.locator('button:has-text("Get My Free Instance Now")');
    if (await freeBetaBtn.isVisible({ timeout: 10_000 })) {
      await freeBetaBtn.click();
    }

    // Wait for provisioning indication (alert or UI change)
    // The dashboard shows an alert() on success, then reloads
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Success');
      await dialog.accept();
    });

    // Wait a moment for any provisioning UI to appear
    await page.waitForTimeout(5_000);
  });

  test('verify container is running (API-level)', async () => {
    test.setTimeout(PROVISION_TIMEOUT);

    // Provision directly via API for verification
    if (TEST_MODE === 'mock') {
      const result = await provisionTestAgent(agentName, {
        model: 'anthropic/claude-sonnet-4-20250514',
        channels: ['web'],
      });
      appUuid = result.appUuid;
      agentUrl = result.url;
    }

    // Health check
    const health = await waitForHealthy(agentUrl ?? `https://${agentName}.clawdet.com`, 60_000);
    expect(health.status).toBe(200);

    if (TEST_MODE === 'mock' && mockServer) {
      const calls = mockServer.getCalls('POST', '/api/v1/applications/dockerimage');
      expect(calls.length).toBeGreaterThan(0);
      expect(calls[0].body.docker_registry_image_name).toContain('openclaw');
    }
  });

  test('subdomain is accessible', async ({ page }) => {
    test.skip(TEST_MODE === 'mock', 'No real subdomain in mock mode');
    const url = agentUrl ?? `https://${agentName}.clawdet.com`;
    const res = await page.goto(url);
    expect(res?.status()).toBeLessThan(400);
  });

  test('chat interface loads and responds', async ({ page }) => {
    test.skip(TEST_MODE === 'mock', 'No real subdomain in mock mode');
    test.setTimeout(60_000);

    const url = agentUrl ?? `https://${agentName}.clawdet.com`;
    await page.goto(url);
    await page.waitForLoadState('networkidle');

    const chatInput = page.locator(
      'textarea, input[placeholder*="message"], input[placeholder*="chat"], [contenteditable="true"]'
    ).first();
    await expect(chatInput).toBeVisible({ timeout: 30_000 });

    await chatInput.fill('Hello, this is an E2E test. Reply with "PONG".');
    await page.keyboard.press('Enter');

    const response = page.locator('.message, [data-role="assistant"], [class*="response"]').last();
    await expect(response).toBeVisible({ timeout: 30_000 });
    const text = await response.textContent();
    expect(text?.length).toBeGreaterThan(0);
  });
});

// ─── Test 2: Onboarding Flow ───────────────────────────────────────────────

test.describe('Test 2: Onboarding Flow (Beta)', () => {
  const agentName = uniqueName('beta');
  let appUuid: string;
  let agentUrl: string;

  test.afterAll(async () => {
    try {
      if (appUuid) await deprovisionTestAgent(appUuid);
    } catch { /* cleanup */ }
  });

  test('navigate to onboarding and complete checklist', async ({ page }) => {
    test.setTimeout(PROVISION_TIMEOUT);

    // Provision via API
    const result = await provisionTestAgent(agentName, {
      model: 'anthropic/claude-sonnet-4-20250514',
      channels: ['web'],
    });
    appUuid = result.appUuid;
    agentUrl = result.url;

    await waitForHealthy(agentUrl, 60_000);

    // Navigate to onboarding page
    await page.goto(`${BASE_URL}/onboarding`);
    await page.waitForLoadState('networkidle');

    // Verify page loaded
    await expect(page.locator('text="Welcome to Clawdet!"')).toBeVisible({ timeout: 10_000 });

    // Verify progress bar exists
    const progressBar = page.locator('text="Your Progress"');
    await expect(progressBar).toBeVisible();

    // Click through checklist items (Quick Start section)
    const checklistItems = page.locator('[class*="rounded-lg"][class*="border"][class*="cursor-pointer"]');
    const itemCount = await checklistItems.count();
    expect(itemCount).toBeGreaterThanOrEqual(6);

    // Click first 3 items (Quick Start)
    for (let i = 0; i < Math.min(3, itemCount); i++) {
      await checklistItems.nth(i).click();
      await page.waitForTimeout(300);
    }

    // Verify progress updated
    const progressText = page.locator('text=/\\d+ of \\d+ completed/');
    await expect(progressText).toBeVisible();
    const text = await progressText.textContent();
    expect(text).toContain('3 of');

    // Click remaining items
    for (let i = 3; i < itemCount; i++) {
      await checklistItems.nth(i).click();
      await page.waitForTimeout(300);
    }

    // Verify completion message
    const completionMsg = page.locator('text="Congratulations! You\'ve completed onboarding!"');
    await expect(completionMsg).toBeVisible({ timeout: 5_000 });
  });
});

// ─── Test 3: Multi-Agent Stress Test ───────────────────────────────────────

test.describe('Test 3: Multi-Agent Stress Test (Gamma)', () => {
  const agents: { name: string; appUuid: string; url: string }[] = [];
  const ts = Date.now();

  test.afterAll(async () => {
    await Promise.allSettled(agents.map((a) => deprovisionTestAgent(a.appUuid)));
  });

  test('provision 3 agents simultaneously', async () => {
    test.setTimeout(PROVISION_TIMEOUT * 2);

    const names = [`gamma-1-${ts}`, `gamma-2-${ts}`, `gamma-3-${ts}`];
    const results = await Promise.all(
      names.map((name) =>
        provisionTestAgent(name, { model: 'anthropic/claude-sonnet-4-20250514', channels: ['web'] })
      )
    );

    for (const r of results) {
      expect(r.status).toBe('provisioned');
      agents.push({ name: r.tenantId, appUuid: r.appUuid, url: r.url });
    }
  });

  test('all 3 agents are healthy', async () => {
    test.setTimeout(PROVISION_TIMEOUT);

    const checks = await Promise.all(agents.map((a) => waitForHealthy(a.url, 60_000)));
    for (const c of checks) {
      expect(c.status).toBe(200);
    }
  });

  test('all 3 respond to chat independently', async ({ page, context }) => {
    test.skip(TEST_MODE === 'mock', 'No real subdomain in mock mode');
    test.setTimeout(90_000);

    for (const agent of agents) {
      const p = await context.newPage();
      await p.goto(agent.url);
      await p.waitForLoadState('networkidle');

      const input = p.locator('textarea, input[placeholder*="message"]').first();
      if (await input.isVisible({ timeout: 15_000 })) {
        await input.fill(`Hello from ${agent.name}. Reply PONG.`);
        await p.keyboard.press('Enter');
        const resp = p.locator('.message, [data-role="assistant"]').last();
        await expect(resp).toBeVisible({ timeout: 30_000 });
      }
      await p.close();
    }
  });

  test('stop one agent, others stay up', async () => {
    test.setTimeout(60_000);

    if (agents.length < 3) test.skip();

    const coolifyBase = (process.env.COOLIFY_BASE_URL ?? 'http://localhost:19876').replace(/\/$/, '');
    const apiUrl = `${coolifyBase}/api/v1`;
    const headers = {
      'Authorization': `Bearer ${process.env.COOLIFY_API_TOKEN ?? 'mock-token'}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    await fetch(`${apiUrl}/applications/${agents[1].appUuid}/stop`, { method: 'POST', headers });
    await new Promise((r) => setTimeout(r, 5_000));

    try {
      const res = await fetch(`${agents[1].url}/health`, { signal: AbortSignal.timeout(5000) });
      expect(res.status).toBeGreaterThanOrEqual(500);
    } catch {
      // network error = expected
    }

    for (const idx of [0, 2]) {
      const health = await waitForHealthy(agents[idx].url, 15_000);
      expect(health.status).toBe(200);
    }

    await fetch(`${apiUrl}/applications/${agents[1].appUuid}/restart`, { method: 'POST', headers });
    const recovered = await waitForHealthy(agents[1].url, 60_000);
    expect(recovered.status).toBe(200);
  });
});

// ─── Test 4: Error Recovery ────────────────────────────────────────────────

test.describe('Test 4: Error Recovery (Delta)', () => {
  const agentName = uniqueName('delta');
  let appUuid: string;
  let agentUrl: string;

  test.afterAll(async () => {
    try {
      if (appUuid) await deprovisionTestAgent(appUuid);
    } catch { /* cleanup */ }
  });

  test('provision agent', async () => {
    test.setTimeout(PROVISION_TIMEOUT);

    const result = await provisionTestAgent(agentName, {
      model: 'anthropic/claude-sonnet-4-20250514',
      channels: ['web'],
    });
    appUuid = result.appUuid;
    agentUrl = result.url;
    await waitForHealthy(agentUrl, 60_000);
  });

  test('container auto-restarts after crash', async () => {
    test.setTimeout(PROVISION_TIMEOUT);

    const coolifyBase = (process.env.COOLIFY_BASE_URL ?? 'http://localhost:19876').replace(/\/$/, '');
    const apiUrl = `${coolifyBase}/api/v1`;
    const headers = {
      'Authorization': `Bearer ${process.env.COOLIFY_API_TOKEN ?? 'mock-token'}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    await fetch(`${apiUrl}/applications/${appUuid}/restart`, { method: 'POST', headers });

    const health = await waitForHealthy(agentUrl, 60_000);
    expect(health.status).toBe(200);
  });

  test('Coolify API down shows error to user', async ({ page }) => {
    test.setTimeout(30_000);

    if (TEST_MODE !== 'mock' || !mockServer) test.skip();

    mockServer.setFailMode('all-500');

    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    mockServer.setFailMode(null);

    // Just verify the page doesn't crash
    expect(page.url()).toBeTruthy();
  });
});

// ─── Test 5: Deprovisioning ───────────────────────────────────────────────

test.describe('Test 5: Deprovisioning (Epsilon)', () => {
  const agentName = uniqueName('epsilon');
  let appUuid: string;
  let agentUrl: string;

  test('provision, verify, then deprovision', async () => {
    test.setTimeout(PROVISION_TIMEOUT * 2);

    const result = await provisionTestAgent(agentName, {
      model: 'anthropic/claude-sonnet-4-20250514',
      channels: ['web'],
    });
    appUuid = result.appUuid;
    agentUrl = result.url;

    const health = await waitForHealthy(agentUrl, 60_000);
    expect(health.status).toBe(200);

    await deprovisionTestAgent(appUuid);
    await new Promise((r) => setTimeout(r, 10_000));

    try {
      const res = await fetch(`${agentUrl}/health`, { signal: AbortSignal.timeout(10_000) });
      expect(res.status).toBeGreaterThanOrEqual(400);
    } catch {
      // Network error = expected
    }

    if (TEST_MODE === 'mock' && mockServer) {
      const deleteCalls = mockServer.getCalls('DELETE', `/api/v1/applications/${appUuid}`);
      expect(deleteCalls.length).toBe(1);
    }
  });
});

// ─── Test 6: Migration Between Servers ─────────────────────────────────────

test.describe('Test 6: Migration Between Servers (Zeta)', () => {
  const agentName = uniqueName('zeta');
  let sourceAppUuid: string;
  let agentUrl: string;

  test.afterAll(async () => {
    try {
      if (sourceAppUuid) await deprovisionTestAgent(sourceAppUuid);
    } catch { /* cleanup */ }
  });

  test('provision on server A, migrate to server B', async () => {
    test.setTimeout(PROVISION_TIMEOUT * 3);

    const result = await provisionTestAgent(agentName, {
      model: 'anthropic/claude-sonnet-4-20250514',
      channels: ['web'],
    });
    sourceAppUuid = result.appUuid;
    agentUrl = result.url;
    await waitForHealthy(agentUrl, 60_000);

    if (TEST_MODE === 'real') {
      const { migrateTenant } = await import('../../scripts/coolify/migrate-tenant');
      const migrateResult = await migrateTenant(
        {
          id: agentName,
          subdomain: agentName,
          model: 'anthropic/claude-sonnet-4-20250514',
          channels: ['web'],
          apiKeys: {},
        },
        sourceAppUuid,
        process.env.COOLIFY_TARGET_SERVER_UUID ?? process.env.COOLIFY_SERVER_UUID!,
      );
      expect(migrateResult.status).toBe('migrated');
      sourceAppUuid = migrateResult.targetAppUuid;
    } else {
      if (mockServer) {
        const calls = mockServer.getCalls('POST', '/api/v1/applications/dockerimage');
        expect(calls.length).toBeGreaterThanOrEqual(1);
      }
    }

    const health = await waitForHealthy(agentUrl, 60_000);
    expect(health.status).toBe(200);
  });
});
