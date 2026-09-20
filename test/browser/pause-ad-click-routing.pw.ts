import { expect, test } from './harness';
import { mountDefaultControlBarUi } from './helpers/control-bar';

/**
 * Pause-ad creatives are rendered natively, below the web UI, which hit-tests at every point. The UI
 * therefore carries a full-bleed click catcher that routes a click back to the ad, stacked *under*
 * the controls so they keep their own hit targets.
 *
 * That ordering is a property of the composed DOM and the stylesheet, so jsdom cannot observe it: a
 * Jest spec can only assert the component order, never that a click at a given point reaches the
 * control rather than the catcher.
 */

// The catcher deliberately carries no role and no accessible name: it exists for pointer input only.
// With no semantic locator to use, a CSS selector is the subject here.
const CLICK_CATCHER = '.bmpui-ui-pause-ad-click-catcher';

const CLICK_THROUGH_URL = 'https://example.com/pause-ad';

for (const hostReset of [false, true]) {
  const hostPage = hostReset ? 'host page with a global border-box reset' : 'host page with no CSS reset';

  test(`a control bar click operates the control and does not open the click-through, ${hostPage}`, async ({
    page,
  }) => {
    const ui = await mountDefaultControlBarUi(page, { hostReset, live: false });
    const controls = page.getByRole('region', { name: 'Video player controls' });
    await controls.getByRole('button', { name: 'Pause' }).click();
    await ui.player.startPauseAd({ clickThroughUrl: CLICK_THROUGH_URL });
    await expect(page.locator(CLICK_CATCHER), 'a creative with a destination must be clickable').toBeVisible();

    // Playwright's hit-target check is half the assertion: if the catcher stacked above the control
    // bar, the click would be intercepted here instead of reaching the button.
    await controls.getByRole('button', { name: 'Play', exact: true }).click();

    await expect(controls.getByRole('button', { name: 'Pause' }), 'the control must still work').toBeVisible();
    expect(await ui.player.clickThroughCount(), 'a control bar click must not open the click-through').toBe(0);
  });

  test(`a click beside the controls opens the click-through, ${hostPage}`, async ({ page }) => {
    const ui = await mountDefaultControlBarUi(page, { hostReset, live: false });
    await ui.player.startPauseAd({ clickThroughUrl: CLICK_THROUGH_URL });

    await expect(
      page.getByRole('button').and(page.locator(CLICK_CATCHER)),
      'the pointer-only catcher must stay out of the accessibility tree',
    ).toHaveCount(0);

    await page.locator(CLICK_CATCHER).click();

    expect(
      await page.locator(CLICK_CATCHER).evaluate(element => document.activeElement === element),
      'the pointer-only catcher must not take browser focus',
    ).toBe(false);
    expect(await ui.player.clickThroughCount(), 'a click on the creative must open the click-through').toBe(1);
  });

  test(`a creative without a destination stays transparent to clicks, ${hostPage}`, async ({ page }) => {
    const ui = await mountDefaultControlBarUi(page, { hostReset, live: false });
    await ui.player.startPauseAd();

    await expect(page.locator(CLICK_CATCHER), 'there is nothing to route a click to').toBeHidden();

    await page.locator('#player').click();

    expect(await ui.player.clickThroughCount(), 'no destination means no click-through').toBe(0);
  });
}

test('an active pause ad survives the first switch to the small-screen variant', async ({ page }) => {
  const ui = await mountDefaultControlBarUi(page, { live: false });
  await ui.player.startPauseAd({ clickThroughUrl: CLICK_THROUGH_URL });
  await expect(page.locator(CLICK_CATCHER), 'the main variant should show the active pause ad').toBeVisible();

  await ui.player.resize(640);

  const smallScreenVariant = page.locator('.bmpui-ui-smallscreen');
  const smallScreenClickCatcher = smallScreenVariant.locator(CLICK_CATCHER);
  await expect(smallScreenVariant, 'the small-screen variant should become active').toBeVisible();
  await expect(smallScreenClickCatcher, 'the active pause ad should survive the variant switch').toBeVisible();
  await smallScreenClickCatcher.click();
  expect(await ui.player.clickThroughCount(), 'the switched variant should retain the click-through callback').toBe(1);
});

test('a finished pause ad is not replayed into a newly configured variant', async ({ page }) => {
  const ui = await mountDefaultControlBarUi(page, { live: false });
  await ui.player.startPauseAd({ clickThroughUrl: CLICK_THROUGH_URL });
  await ui.player.finishPauseAd();

  await ui.player.resize(640);

  const smallScreenVariant = page.locator('.bmpui-ui-smallscreen');
  await expect(smallScreenVariant, 'the small-screen variant should become active').toBeVisible();
  await expect(smallScreenVariant.locator(CLICK_CATCHER), 'a finished pause ad must not be replayed').toBeHidden();
});

test('a terminal event for another ad does not clear the pause ad replay state', async ({ page }) => {
  const ui = await mountDefaultControlBarUi(page, { live: false });
  await ui.player.startPauseAd({ clickThroughUrl: CLICK_THROUGH_URL });
  await ui.player.finishPauseAd('other-ad');

  await ui.player.resize(640);

  const smallScreenVariant = page.locator('.bmpui-ui-smallscreen');
  await expect(smallScreenVariant, 'the small-screen variant should become active').toBeVisible();
  await expect(
    smallScreenVariant.locator(CLICK_CATCHER),
    'an unrelated terminal event must not clear the active pause ad',
  ).toBeVisible();
});

test('source unload prevents replaying a pause ad into a newly configured variant', async ({ page }) => {
  const ui = await mountDefaultControlBarUi(page, { live: false });
  await ui.player.startPauseAd({ clickThroughUrl: CLICK_THROUGH_URL });
  await ui.player.unloadSource();
  await ui.player.loadSource();

  await ui.player.resize(640);

  const smallScreenVariant = page.locator('.bmpui-ui-smallscreen');
  await expect(smallScreenVariant, 'the small-screen variant should become active').toBeVisible();
  await expect(smallScreenVariant.locator(CLICK_CATCHER), 'an unloaded pause ad must not be replayed').toBeHidden();
});
