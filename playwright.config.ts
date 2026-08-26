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
  // `.pw.ts` rather than Playwright's default `.spec.ts`/`.test.ts`, because Jest sets no
  // `testMatch` of its own and its default would claim those names and run them in jsdom, where
  // every measurement is 0. Choosing an extension Jest ignores means telling Playwright about it.
  testMatch: '**/*.pw.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0, // These must be deterministic. A retry would hide flakiness instead of surfacing it.
  // On CI also emit the HTML report, which the workflow uploads as an artifact when a run fails.
  reporter: process.env.CI ? [['line'], ['html', { open: 'never' }]] : [['list']],
  use: {
    ...devices['Desktop Chrome'],
    // Fixed viewport so layout is not a function of the runner's window size.
    //
    // Both values here also decide *which* UI variant is under test, so neither is arbitrary.
    // `UIFactory.buildUI` resolves the small-screen layout below a document width of 800, and the
    // TV and mobile layouts from `BrowserUtils`, which reads the user agent this device profile
    // supplies. Narrowing the viewport or changing the profile silently swaps the layout being
    // measured — `mountUi` asserts the main variant mounted, so it fails loudly rather than
    // quietly measuring something else.
    viewport: { width: 1280, height: 720 },
  },
  projects: [{ name: 'chromium' }],
});
