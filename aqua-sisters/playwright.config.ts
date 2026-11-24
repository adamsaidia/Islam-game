import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
const env = {
  DATABASE_URL: process.env.E2E_DATABASE_URL || 'postgres://postgres@localhost:5433/aqua_e2e',
  APP_URL: `http://localhost:${PORT}`,
  PAYMENT_PROVIDER: 'mock',
  ALLOW_MOCK_PAYMENTS: 'true',
  ENCRYPTION_KEY: 'e2e-encryption-key-0123456789abcdef',
  CRON_SECRET: 'e2e-cron',
  ADMIN_2FA_OPTIONAL: 'true',
};

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  reporter: [['list']],
  use: { baseURL: env.APP_URL, trace: 'off', locale: 'nl-NL', timezoneId: 'Europe/Amsterdam' },
  projects: [
    { name: 'mobiel', use: { ...devices['iPhone 13'], browserName: 'chromium' } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: `node tests/e2e/setup-db.mjs && npx next start -p ${PORT}`,
    url: `${env.APP_URL}/robots.txt`,
    env,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
