import { defineConfig, devices } from '@playwright/test';

/**
 * Browser-level layout tests.
 *
 * These exist because jsdom does no layout: `offsetWidth` is always 0 there, so no Jest spec can
 * see a sizing regression. Everything here runs against the built bundle in a real browser.
 *
 * Run `npm run build` first, or use `npm run test:browser` which does it for you.
 */
export default defineConfig({
  testDir: './test/browser',
  // Jest has no `testMatch` override and would otherwise pick these up and run them in jsdom.
  testMatch: '**/*.pw.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0, // These must be deterministic. A retry would hide flakiness instead of surfacing it.
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    ...devices['Desktop Chrome'],
    // Fixed viewport so layout is not a function of the runner's window size.
    viewport: { width: 1280, height: 720 },
  },
  projects: [{ name: 'chromium' }],
});
