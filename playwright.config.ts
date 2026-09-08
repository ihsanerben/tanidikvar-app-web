import { defineConfig, devices } from '@playwright/test'

for(const key of ['E2E_BASE_URL','E2E_MAILPIT_URL','E2E_POSTGRES_CONTAINER','E2E_DB_USER','E2E_DB_NAME']) {
  if(!process.env[key])throw new Error(`${key} is required. Browser tests create synthetic records; use the isolated test environment described in README.md.`)
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  reporter: 'list',
  use: { baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
  ],
})
