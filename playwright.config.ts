import { defineConfig, devices } from '@playwright/test';

// BASE_URL=https://brentstees.com runs the same suite against the live site.
const baseURL = process.env.BASE_URL ?? 'http://127.0.0.1:4321';

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'npm run preview -- --host 127.0.0.1 --port 4321',
        url: baseURL,
        reuseExistingServer: true,
      },
});
