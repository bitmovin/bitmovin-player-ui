import type { Page } from '@playwright/test';
import { expect, MountOptions, mountUi, test } from './harness';

/**
 * Status changes that do not move focus must reach screen reader users through a live region
 * (WCAG 4.1.3). A live region is only announced reliably when it is already rendered before its
 * content changes, so these scenarios check the real markup and accessibility tree in a browser.
 *
 * The page clock is paused, so stall thresholds and the live region's clear-then-write delay only
 * pass when a test advances them.
 */

/** Delay between clearing the live region and writing the message, see `StatusAnnouncer`. */
const ANNOUNCE_DELAY_MS = 100;
/** `BufferingOverlayConfig.showDelayMs` default. */
const BUFFERING_SHOW_DELAY_MS = 1000;

async function mountWithPausedClock(page: Page, options: MountOptions = {}) {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  return mountUi(page, { live: false, ...options });
}

for (const factory of ['default', 'smallScreen', 'tv'] as const) {
  test(`the ${factory} UI renders one empty, visually hidden status region at mount`, async ({ page }) => {
    await mountUi(page, { factory });

    const status = page.getByRole('status');
    await expect(status).toHaveCount(1);
    await expect(status).toHaveAttribute('aria-live', 'polite');
    await expect(status).toHaveAttribute('aria-atomic', 'true');
    await expect(status).toHaveText('');

    const box = await status.boundingBox();
    expect(box, 'the status region must be rendered, or screen readers ignore it').not.toBeNull();
    expect(box!.width * box!.height, 'the status region must not take visible space').toBeLessThanOrEqual(1);
  });
}

test('a stall longer than the buffering threshold is announced', async ({ page }) => {
  const ui = await mountWithPausedClock(page);
  const status = page.getByRole('status');

  await ui.player.startStall();
  await page.clock.runFor(BUFFERING_SHOW_DELAY_MS - 1);
  await expect(status).toHaveText('');

  await page.clock.runFor(1 + ANNOUNCE_DELAY_MS);
  await expect(status).toHaveText('Buffering');
});

test('a stall shorter than the buffering threshold is not announced', async ({ page }) => {
  const ui = await mountWithPausedClock(page);

  await ui.player.startStall();
  await page.clock.runFor(BUFFERING_SHOW_DELAY_MS / 2);
  await ui.player.endStall();
  await page.clock.runFor(BUFFERING_SHOW_DELAY_MS + ANNOUNCE_DELAY_MS);

  await expect(page.getByRole('status')).toHaveText('');
});

test('the start of a linear ad is announced through the same region after switching to the ads UI', async ({
  page,
}) => {
  const ui = await mountWithPausedClock(page);

  await ui.player.startLinearAd();
  await page.clock.runFor(ANNOUNCE_DELAY_MS);

  const status = page.getByRole('status');
  await expect(status, 'switching UI variants must not add a second region').toHaveCount(1);
  await expect(status).toHaveText('Ad started');
});

test('a skippable ad announces when it can be skipped', async ({ page }) => {
  const ui = await mountWithPausedClock(page);
  const status = page.getByRole('status');
  await ui.player.startLinearAd({ skippableAfter: 5 });
  await page.clock.runFor(ANNOUNCE_DELAY_MS);
  await expect(status).toHaveText('Ad started');

  await ui.player.playTo(4);
  await page.clock.runFor(ANNOUNCE_DELAY_MS);
  await expect(status).toHaveText('Ad started');

  await ui.player.playTo(5);
  await page.clock.runFor(ANNOUNCE_DELAY_MS);
  await expect(status).toHaveText('You can skip the ad now');
});

test('the end of playback is announced', async ({ page }) => {
  const ui = await mountWithPausedClock(page);

  await ui.player.finishPlayback();
  await page.clock.runFor(ANNOUNCE_DELAY_MS);

  await expect(page.getByRole('status')).toHaveText('Playback finished');
});

test('a fatal error is exposed as an alert and not repeated in the status region', async ({ page }) => {
  const ui = await mountWithPausedClock(page);

  await ui.player.raiseError(1000, 'UNKNOWN_ERROR');
  await page.clock.runFor(ANNOUNCE_DELAY_MS);

  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('Error is unknown');
  await expect(page.getByRole('status')).toHaveText('');
});
