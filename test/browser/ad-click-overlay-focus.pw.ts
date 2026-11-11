import { Page } from '@playwright/test';
import { expect, mountUi, test } from './harness';

/**
 * The ad click-through overlay is a full-size button. While the playing ad has no click-through URL there is nothing
 * to open, so keyboard and assistive technology users must not land on it.
 *
 * Real focus and sequential Tab order are not observable in jsdom.
 */

// A long hide delay keeps the UI's own timer from hiding the controls mid-test.
const HIDE_DELAY = 600_000;
const ADS_UI = '.bmpui-ui-uicontainer.bmpui-ui-ads';
const CLICK_OVERLAY = `${ADS_UI} .bmpui-ui-clickoverlay`;
const CLICK_OVERLAY_NAME = 'Learn more about this ad, opens in a new tab';
const CLICK_THROUGH_URL = 'https://example.com/ad';
// Far more Tab stops than the ads UI has, so a walk that does not end by itself fails loudly instead of looping.
const MAX_TAB_STOPS = 50;

/**
 * Tabs through the page from the start and reports whether the click-through overlay was one of the Tab stops.
 *
 * Fails when the walk visits no control at all, so an unrendered UI cannot pass as "overlay not reachable".
 */
async function tabOrderReachesClickOverlay(page: Page): Promise<boolean> {
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());

  const visited = new Set<string>();
  let reachedClickOverlay = false;
  for (let i = 0; i < MAX_TAB_STOPS; i++) {
    await page.keyboard.press('Tab');
    const stop = await page.evaluate(overlaySelector => {
      const active = document.activeElement;
      if (!active || active === document.body) {
        return null;
      }
      return { id: active.id || active.tagName, isClickOverlay: active === document.querySelector(overlaySelector) };
    }, CLICK_OVERLAY);

    if (!stop || visited.has(stop.id)) {
      expect(visited.size, 'the Tab walk has to visit the ads UI controls').toBeGreaterThan(0);
      return reachedClickOverlay;
    }
    visited.add(stop.id);
    reachedClickOverlay = reachedClickOverlay || stop.isClickOverlay;
  }
  throw new Error(`the Tab walk did not end within ${MAX_TAB_STOPS} stops`);
}

test('the ad click-through overlay gives up focus and leaves the Tab order when the next ad has no click-through', async ({
  page,
}) => {
  const ui = await mountUi(page, { live: false, hideDelay: HIDE_DELAY });
  await ui.player.startLinearAd({ clickThroughUrl: CLICK_THROUGH_URL });
  await expect(page.locator(ADS_UI)).toBeVisible();

  const clickOverlay = page.locator(CLICK_OVERLAY);
  await expect(page.getByRole('button', { name: CLICK_OVERLAY_NAME })).toBeVisible();
  expect(await tabOrderReachesClickOverlay(page), 'an ad with a click-through is reachable by Tab').toBe(true);

  await clickOverlay.focus();
  await expect(clickOverlay).toBeFocused();

  await ui.player.finishLinearAd();
  await ui.player.startLinearAd();

  await expect(clickOverlay, 'focus must not stay on an element hidden from assistive technology').not.toBeFocused();
  await expect(page.locator(ADS_UI), 'focus should stay within the player').toBeFocused();
  await expect(page.getByRole('button', { name: CLICK_OVERLAY_NAME })).toHaveCount(0);
  expect(await tabOrderReachesClickOverlay(page), 'an ad without a click-through is not reachable by Tab').toBe(false);
});
