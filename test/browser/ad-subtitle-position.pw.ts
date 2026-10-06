import { Page } from '@playwright/test';
import { expect, MountOptions, mountUi, test } from './harness';

const VARIANTS = [
  { name: 'ads', factory: 'default' },
  { name: 'small-screen ads', factory: 'smallScreen' },
  { name: 'TV ads', factory: 'tv' },
] as const;

// Moving the pointer is how a user shows and hides the controls. A long hide delay keeps the UI's own timer
// out of the picture, so the controls only change state when a test moves the pointer.
const HIDE_DELAY = 600_000;

// The main UI stays in the DOM, hidden, while the ads UI is active and receives the same cues. Scope everything
// to the ads UI so a measurement can never pick up the hidden main layout's overlay.
const ADS_UI = '.bmpui-ui-uicontainer.bmpui-ui-ads';

async function mountAdUi(page: Page, factory: NonNullable<MountOptions['factory']>): Promise<void> {
  const ui = await mountUi(page, { factory, live: false, hideDelay: HIDE_DELAY });
  await ui.player.startLinearAd();
  await ui.player.enterCue('Ad subtitle');
  await expect(page.locator(ADS_UI)).toBeVisible();
  await expect(page.locator(`${ADS_UI} .bmpui-ui-subtitle-label`)).toHaveText('Ad subtitle');
}

async function showControls(page: Page): Promise<void> {
  await page.mouse.move(500, 300);
  await expect(page.locator(ADS_UI)).toHaveClass(/bmpui-controls-shown/);
}

async function hideControls(page: Page): Promise<void> {
  // Leaving the player hides the controls immediately.
  await page.mouse.move(1200, 650);
  await expect(page.locator(ADS_UI)).toHaveClass(/bmpui-controls-hidden/);
}

async function subtitleBottom(page: Page): Promise<number> {
  const box = await page.locator(`${ADS_UI} .bmpui-ui-subtitle-label`).boundingBox();
  if (!box) {
    throw new Error('the ad subtitle has to be rendered to be measured');
  }
  return box.y + box.height;
}

/** Space between the bottom of the subtitle and the top of the ad control bar's seek bar row. Positive means it clears. */
async function clearanceAboveControls(page: Page): Promise<number> {
  const seekBarRow = await page.locator(`${ADS_UI} .bmpui-ad-controlbar-top`).boundingBox();
  if (!seekBarRow) {
    throw new Error('the ad seek bar row has to be rendered to be measured');
  }
  return seekBarRow.y - (await subtitleBottom(page));
}

for (const { name, factory } of VARIANTS) {
  test.describe(name, () => {
    test('shows the ad subtitle clear of the controls while they are hidden', async ({ page }) => {
      await mountAdUi(page, factory);

      await hideControls(page);

      await expect.poll(() => clearanceAboveControls(page)).toBeGreaterThanOrEqual(0);
    });

    test('keeps the ad subtitle clear of the controls while they are shown', async ({ page }) => {
      await mountAdUi(page, factory);

      await showControls(page);

      await expect.poll(() => clearanceAboveControls(page)).toBeGreaterThanOrEqual(0);
    });
  });
}

test('lifts the ad subtitle when the remaining ad controls appear', async ({ page }) => {
  await mountAdUi(page, 'default');
  await hideControls(page);
  await expect.poll(() => clearanceAboveControls(page)).toBeGreaterThanOrEqual(0);
  const bottomWhileHidden = await subtitleBottom(page);

  await showControls(page);

  await expect.poll(() => subtitleBottom(page)).toBeLessThan(bottomWhileHidden);
});
