import { expect, mountUi, test } from './harness';

test.use({ hasTouch: true });

const CLICK_THROUGH_URL = 'https://example.com/pause-ad';

test('a mobile pause ad keeps touch seeking available and hides only its centered playback button', async ({
  page,
}) => {
  const ui = await mountUi(page, { factory: 'smallScreen', live: false, mobile: true });
  const touchOverlay = page.locator('.bmpui-ui-touch-control-overlay');
  const centeredPlaybackButton = touchOverlay.locator('.bmpui-ui-smallcenteredplaybacktogglebutton');

  await expect(touchOverlay, 'the mobile layout should use the touch overlay').toBeVisible();

  await ui.player.startPauseAd({ clickThroughUrl: CLICK_THROUGH_URL });

  await expect(touchOverlay, 'touch seeking must remain available during a pause ad').toBeVisible();
  await expect(touchOverlay, 'the creative must not be dimmed by visible touch controls').toHaveCSS(
    'background-color',
    'rgba(0, 0, 0, 0)',
  );
  await expect(centeredPlaybackButton, 'only the centered playback button should be suppressed').toBeHidden();
});

test('double taps seek in both directions during a clickable mobile pause ad without opening it', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  const ui = await mountUi(page, { factory: 'smallScreen', live: false, mobile: true });
  await page.clock.runFor(20);
  await ui.player.startPauseAd({ clickThroughUrl: CLICK_THROUGH_URL });

  const bounds = await page.locator('.bmpui-ui-touch-control-overlay').boundingBox();
  if (!bounds) {
    throw new Error('the mobile gesture surface must be laid out');
  }
  const y = bounds.y + bounds.height / 2;
  const initialTime = await ui.player.currentTime();

  await page.touchscreen.tap(bounds.x + bounds.width * 0.8, y);
  await page.touchscreen.tap(bounds.x + bounds.width * 0.8, y);
  await expect.poll(() => ui.player.currentTime()).toBeGreaterThan(initialTime);
  await page.clock.runFor(250);
  expect(await ui.player.clickThroughCount(), 'a seek gesture must not also open the ad').toBe(0);

  await page.touchscreen.tap(bounds.x + bounds.width * 0.2, y);
  await page.touchscreen.tap(bounds.x + bounds.width * 0.2, y);
  await expect.poll(() => ui.player.currentTime()).toBe(initialTime);
  await page.clock.runFor(250);
  expect(await ui.player.clickThroughCount()).toBe(0);
  expect(await ui.player.openedUrls()).toEqual([]);
});

test('a tap restores controls hidden by a center double tap before a later tap opens the ad', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  const ui = await mountUi(page, { factory: 'smallScreen', live: false, mobile: true, hideDelay: 60_000 });
  await page.clock.runFor(20);

  const touchOverlay = page.locator('.bmpui-ui-touch-control-overlay');
  const uiContainer = page.locator('.bmpui-ui-uicontainer');
  const bounds = await touchOverlay.boundingBox();
  if (!bounds) {
    throw new Error('the mobile gesture surface must be laid out');
  }
  const center = {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  };

  await page.touchscreen.tap(center.x, center.y);
  await page.clock.runFor(250);
  await expect(uiContainer, 'controls should start visible').toHaveClass(/bmpui-controls-shown/);
  await ui.player.startPauseAd({ clickThroughUrl: CLICK_THROUGH_URL });
  await page.touchscreen.tap(center.x, center.y);
  await page.touchscreen.tap(center.x, center.y);
  await page.clock.runFor(250);
  await expect(uiContainer, 'a center double tap should hide the controls').toHaveClass(/bmpui-controls-hidden/);

  await page.touchscreen.tap(center.x, center.y);
  await page.clock.runFor(250);

  await expect(uiContainer, 'the first tap with hidden controls should reveal them').toHaveClass(
    /bmpui-controls-shown/,
  );
  expect(await ui.player.openedUrls(), 'revealing controls must not open the ad').toEqual([]);
  expect(await ui.player.clickThroughCount(), 'revealing controls must not track a click').toBe(0);

  await page.touchscreen.tap(center.x, center.y);
  await page.clock.runFor(250);

  expect(await ui.player.openedUrls(), 'a later tap with visible controls should still open the ad').toEqual([
    CLICK_THROUGH_URL,
  ]);
  expect(await ui.player.clickThroughCount()).toBe(1);
});

test('a single mobile tap opens the creative once after the double-tap window', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  const ui = await mountUi(page, { factory: 'smallScreen', live: false, mobile: true });
  await page.clock.runFor(20);
  await ui.player.startPauseAd({ clickThroughUrl: CLICK_THROUGH_URL });

  await page.locator('.bmpui-ui-touch-control-overlay').tap();
  expect(await ui.player.clickThroughCount(), 'wait for a possible second tap').toBe(0);
  await page.clock.runFor(250);

  expect(await ui.player.openedUrls()).toEqual([CLICK_THROUGH_URL]);
  expect(await ui.player.clickThroughCount()).toBe(1);
  expect(await ui.player.currentTime()).toBe(0);
});

test('tapping Close ends a clickable mobile pause ad without opening it', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  const ui = await mountUi(page, { factory: 'smallScreen', live: false, mobile: true });
  await page.clock.runFor(20);
  await ui.player.startPauseAd({ clickThroughUrl: CLICK_THROUGH_URL });
  const dismiss = page.getByRole('button', { name: 'Close', exact: true });

  await dismiss.tap();
  // Let a wrongly started single-tap action run out its double-tap window.
  await page.clock.runFor(250);

  await expect(dismiss, 'Close must end the pause ad').toBeHidden();
  expect(await ui.player.pauseAdActive(), 'Close must end the player-side ad').toBe(false);
  expect(await ui.player.openedUrls(), 'Close must not open the click-through').toEqual([]);
  expect(await ui.player.clickThroughCount()).toBe(0);
});

for (const lifecycle of ['finish', 'unload', 'replace'] as const) {
  test(`a pending mobile click-through is cancelled on ad ${lifecycle}`, async ({ page }) => {
    await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
    await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
    const ui = await mountUi(page, { factory: 'smallScreen', live: false, mobile: true });
    await page.clock.runFor(20);
    await ui.player.startPauseAd({ clickThroughUrl: CLICK_THROUGH_URL });

    await page.locator('.bmpui-ui-touch-control-overlay').tap();
    if (lifecycle === 'finish') {
      await ui.player.finishPauseAd();
    } else if (lifecycle === 'unload') {
      await ui.player.unloadSource();
    } else {
      await ui.player.startPauseAd({ clickThroughUrl: CLICK_THROUGH_URL });
    }
    await page.clock.runFor(250);

    expect(await ui.player.clickThroughCount()).toBe(0);
    expect(await ui.player.openedUrls()).toEqual([]);
    expect(await ui.player.currentTime()).toBe(0);
  });
}

test('switching away from the mobile UI cancels a pending click-through', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  const ui = await mountUi(page, { live: false, mobile: true });
  await page.clock.runFor(20);
  await ui.player.resize(640);
  await ui.player.startPauseAd({ clickThroughUrl: CLICK_THROUGH_URL });

  await page.locator('.bmpui-ui-touch-control-overlay').tap();
  await ui.player.resize(1000);
  await page.clock.runFor(250);

  expect(await ui.player.clickThroughCount()).toBe(0);
  expect(await ui.player.openedUrls()).toEqual([]);
});
