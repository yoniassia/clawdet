// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  testMatch: 'provisioning.spec.ts',
  timeout: 120_000,
  expect: { timeout: 30_000 },
  retries: 1,
  workers: 1,
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

  reporter: [['list']],
});
