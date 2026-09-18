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

    await page.locator(CLICK_CATCHER).click();

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
