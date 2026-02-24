/**
 * Playwright Config — Provisioning E2E Tests
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'provisioning.spec.ts',
  timeout: 120_000,
  expect: { timeout: 30_000 },
  retries: 1,
  workers: 1, // Sequential — avoid resource conflicts
  fullyParallel: false,

  use: {
    baseURL: process.env.CLAWDET_URL ?? 'https://clawdet.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  reporter: [
    ['list'],
    ['html', { outputFolder: '../../playwright-report/provisioning' }],
    ['json', { outputFile: '../../test-results/provisioning.json' }],
  ],
});
