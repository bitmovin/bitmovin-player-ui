import type { Page } from '@playwright/test';
import { expect, MountOptions, mountUi, test } from './harness';
import { recordLiveRegionWrites } from './helpers/live-regions';

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
/** Time after which the live region is emptied again, see `StatusAnnouncer`. */
const CLEAR_DELAY_MS = 5000;
/** `BufferingOverlayConfig.showDelayMs` default. */
const BUFFERING_SHOW_DELAY_MS = 1000;

async function mountWithPausedClock(page: Page, options: MountOptions = {}) {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  return mountUi(page, { live: false, ...options });
}

for (const factory of ['default', 'smallScreen', 'tv'] as const) {
  test(`the ${factory} UI renders one empty, visually hidden status and alert region at mount`, async ({ page }) => {
    await mountUi(page, { factory });

    const status = page.getByRole('status');
    const alert = page.getByRole('alert');
    await expect(status).toHaveCount(1);
    await expect(status).toHaveAttribute('aria-live', 'polite');
    await expect(status).toHaveAttribute('aria-atomic', 'true');
    await expect(alert).toHaveCount(1);
    // `alert` is implicitly assertive; an explicit aria-live makes iOS VoiceOver read it twice
    await expect(alert).not.toHaveAttribute('aria-live');
    await expect(alert).toHaveAttribute('aria-atomic', 'true');

    for (const region of [status, alert]) {
      await expect(region).toHaveText('');
      const box = await region.boundingBox();
      expect(box, 'a live region must be rendered, or screen readers ignore it').not.toBeNull();
      expect(box!.width * box!.height, 'a live region must not take visible space').toBeLessThanOrEqual(1);
    }
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

test('switching to the small-screen UI during a stall does not announce the stall again', async ({ page }) => {
  const ui = await mountWithPausedClock(page);
  const writes = await recordLiveRegionWrites(page.getByRole('status'));
  await ui.player.startStall();
  await page.clock.runFor(BUFFERING_SHOW_DELAY_MS + ANNOUNCE_DELAY_MS);

  await ui.player.resize(600);
  await page.clock.runFor(BUFFERING_SHOW_DELAY_MS + ANNOUNCE_DELAY_MS);

  await expect(page.locator('.bmpui-ui-smallscreen'), 'the UI must switch to its small-screen variant').toBeVisible();
  expect(await writes()).toEqual(['Buffering']);
});

test('a later, separate stall is announced again', async ({ page }) => {
  const ui = await mountWithPausedClock(page);
  const writes = await recordLiveRegionWrites(page.getByRole('status'));
  await ui.player.startStall();
  await page.clock.runFor(BUFFERING_SHOW_DELAY_MS + ANNOUNCE_DELAY_MS);
  await ui.player.endStall();

  await ui.player.startStall();
  await page.clock.runFor(BUFFERING_SHOW_DELAY_MS + ANNOUNCE_DELAY_MS);

  expect(await writes()).toEqual(['Buffering', 'Buffering']);
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

test('switching to the small-screen ads UI during an ad does not repeat its announcements', async ({ page }) => {
  const ui = await mountWithPausedClock(page);
  const writes = await recordLiveRegionWrites(page.getByRole('status'));
  await ui.player.startLinearAd({ skippableAfter: 0 });
  await page.clock.runFor(ANNOUNCE_DELAY_MS + CLEAR_DELAY_MS);

  await ui.player.resize(600);
  await page.clock.runFor(ANNOUNCE_DELAY_MS);

  const smallScreenAdsUi = page.locator('.bmpui-ui-smallscreen.bmpui-ui-ads');
  await expect(smallScreenAdsUi, 'the ads UI must switch to its small-screen variant').toBeVisible();
  await expect(
    smallScreenAdsUi.getByRole('button', { name: 'Skip' }),
    'the replayed ad start must still set up the new variant',
  ).toBeVisible();
  expect(await writes()).toEqual(['Ad started You can skip the ad now']);
});

test('the end of playback is announced', async ({ page }) => {
  const ui = await mountWithPausedClock(page);

  await ui.player.finishPlayback();
  await page.clock.runFor(ANNOUNCE_DELAY_MS);

  await expect(page.getByRole('status')).toHaveText('Playback finished');
});

test('fatal errors are written into the alert region after the error overlay is shown', async ({ page }) => {
  const ui = await mountWithPausedClock(page);
  const alert = page.getByRole('alert');
  const overlay = page.locator('.bmpui-ui-errormessage-overlay');
  const writes = await recordLiveRegionWrites(alert);

  await ui.player.raiseError(1000, 'UNKNOWN_ERROR');

  await expect(overlay).toBeVisible();
  await expect(overlay).toContainText('Error is unknown');
  await expect(alert, 'the error must be written after the overlay is shown').toHaveText('');

  await page.clock.runFor(ANNOUNCE_DELAY_MS);
  await expect(alert).toHaveText('Error is unknown (UNKNOWN_ERROR)');
  await expect(page.getByRole('alert'), 'the visible overlay must not be a second alert').toHaveCount(1);
  await expect(page.getByRole('status'), 'errors must not also be announced politely').toHaveText('');

  await ui.player.raiseError(1100, 'SETUP_ERROR');
  await page.clock.runFor(ANNOUNCE_DELAY_MS);

  await expect(overlay).toContainText('General setup error');
  expect(await writes()).toEqual(['Error is unknown (UNKNOWN_ERROR)', 'General setup error (SETUP_ERROR)']);
});
