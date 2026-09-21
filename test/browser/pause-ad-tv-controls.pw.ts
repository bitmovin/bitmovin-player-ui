import { expect, test } from './harness';
import { pauseAdStatusTitleBarOverlaps } from './helpers/pause-ad';
import { focusedControlName, mountTvUi } from './helpers/tv';

/**
 * A pause-ad creative is rendered below the UI, so the UI must keep every control a TV viewer needs
 * while suppressing only the large centered playback control that would sit on top of the creative.
 *
 * None of this is observable in jsdom: which controls stay visible is a stylesheet property, and
 * which controls a remote can reach depends on real focus moving through the active spatial
 * navigation group.
 */

const CENTERED_PLAYBACK_OVERLAY = '.bmpui-ui-playbacktoggle-overlay';
const CENTERED_PLAYBACK_BUTTON = '.bmpui-ui-hugeplaybacktogglebutton';
const CLICK_THROUGH_URL = 'https://example.com/pause-ad';

test('a pause ad keeps the TV controls visible and suppresses only the centered playback control', async ({ page }) => {
  const ui = await mountTvUi(page, { live: false });

  await ui.player.startPauseAd({ clickThroughUrl: CLICK_THROUGH_URL });

  await expect(page.getByRole('slider'), 'the seek bar must stay usable during a pause ad').toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Settings' }),
    'settings must stay reachable during a pause ad',
  ).toBeVisible();
  await expect(
    page.locator(CENTERED_PLAYBACK_OVERLAY),
    'only the centered playback control may be suppressed',
  ).toBeHidden();
});

test('a pause ad moves remote focus to Dismiss and keeps the centered playback control out of reach', async ({
  page,
}) => {
  const ui = await mountTvUi(page, { live: false });

  await ui.player.startPauseAd({ clickThroughUrl: CLICK_THROUGH_URL });

  const dismiss = page.getByRole('button', { name: 'Close' });
  const settings = page.getByRole('button', { name: 'Settings' });
  await expect(dismiss, 'the dismiss button should receive focus when the pause ad starts').toBeFocused();

  // Walk from the dismiss button through the controls to Settings. The centered playback control
  // is suppressed, so it must not become part of this path.
  const visited: string[] = [];
  for (const key of ['ArrowDown', 'ArrowDown', 'ArrowRight']) {
    await page.keyboard.press(key);
    visited.push(await focusedControlName(page));
  }

  expect(visited, 'remote navigation must never reach the centered playback control').not.toContain(
    'bmpui-ui-hugeplaybacktogglebutton',
  );
  await expect(
    page.locator(CENTERED_PLAYBACK_BUTTON),
    'the centered playback control must not hold focus during a pause ad',
  ).not.toBeFocused();
  expect(visited.join(' '), 'the seek bar must be reachable by remote during a pause ad').toContain('bmpui-ui-seekbar');
  expect(visited.join(' '), 'settings must be reachable by remote during a pause ad').toContain(
    'bmpui-ui-settingstogglebutton',
  );
  await expect(settings, 'the remote should finish on Settings').toBeFocused();

  await page.keyboard.press('Enter');

  await expect(
    page.locator('.bmpui-ui-settings-panel:not(.bmpui-ui-listbox)'),
    'Settings must open during a pause ad',
  ).toBeVisible();
});

test('a pause ad restores the focused settings item after temporarily taking remote focus', async ({ page }) => {
  const ui = await mountTvUi(page, { live: false });
  const settings = page.getByRole('button', { name: 'Settings' });
  const settingsPanel = page.locator('.bmpui-ui-settings-panel:not(.bmpui-ui-listbox)');

  for (const key of ['ArrowDown', 'ArrowDown', 'ArrowRight']) {
    await page.keyboard.press(key);
  }
  await expect(settings, 'the remote should reach Settings before the ad starts').toBeFocused();
  await page.keyboard.press('Enter');
  await expect(settingsPanel, 'Settings should be open before the ad starts').toBeVisible();

  // Open playback speed and focus an option. If restoration regresses, focus returns to the back button.
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.keyboard.press('ArrowDown');
  const focusedSettingsItemId = await page.evaluate(() => document.activeElement?.id);
  expect(focusedSettingsItemId, 'a playback-speed option should be focused').toBeTruthy();
  const focusedSettingsItem = page.locator(`#${focusedSettingsItemId}`);
  await expect(focusedSettingsItem).toHaveClass(/bmpui-ui-settings-panel-item-select-option/);

  await ui.player.startPauseAd({ clickThroughUrl: CLICK_THROUGH_URL });
  await expect(page.getByRole('button', { name: 'Close' }), 'the pause ad should temporarily take focus').toBeFocused();

  await ui.player.finishPauseAd();

  await expect(settingsPanel, 'the open Settings panel must stay open').toBeVisible();
  await expect(focusedSettingsItem, 'focus must return to the settings item the viewer left').toBeFocused();
});

test('dismissing a pause ad by remote ends it and returns focus where it was', async ({ page }) => {
  const ui = await mountTvUi(page, { live: false });

  // Arrange a distinct prior focus so restoring it is observable.
  await page.keyboard.press('ArrowDown');
  const seekBar = page.getByRole('slider');
  await expect(seekBar, 'the remote should reach the seek bar before the ad starts').toBeFocused();

  await ui.player.startPauseAd({ clickThroughUrl: CLICK_THROUGH_URL });
  const dismiss = page.getByRole('button', { name: 'Close' });
  await expect(dismiss, 'the dismiss button should receive focus when the pause ad starts').toBeFocused();

  await page.keyboard.press('Enter');

  await expect(dismiss, 'dismissing must end the pause ad').toBeHidden();
  await expect(page.locator('.bmpui-ui-pause-ad-click-catcher'), 'the click target must go with it').toBeHidden();
  expect(await ui.player.pauseAdActive(), 'dismissing must end the player-side ad').toBe(false);
  await expect(seekBar, 'focus must return to the control the viewer left').toBeFocused();
});

test('the pause status controls share the top edge with the title bar without covering it', async ({ page }) => {
  const ui = await mountTvUi(page, {
    live: false,
    metadata: { title: 'A title long enough to reach across the player', description: 'And a description below it' },
  });

  await ui.player.startPauseAd({ clickThroughUrl: CLICK_THROUGH_URL });

  const overlaps = await pauseAdStatusTitleBarOverlaps(page);
  expect(overlaps, 'the pause status row must not cover title-bar content').toEqual([]);
});

test('BACK cannot make a pause ad disappear while the creative is still showing', async ({ page }) => {
  const ui = await mountTvUi(page, { live: false });

  await ui.player.startPauseAd({ clickThroughUrl: CLICK_THROUGH_URL });
  const dismiss = page.getByRole('button', { name: 'Close' });
  await expect(dismiss, 'the dismiss button should receive focus when the pause ad starts').toBeFocused();

  await page.keyboard.press('Escape');

  await expect(dismiss, 'BACK must not remove the way out of the ad').toBeVisible();
  await expect(
    page.locator('.bmpui-ui-pause-ad-click-catcher'),
    'BACK must not remove the click target from a creative that is still showing',
  ).toBeVisible();
  await expect(dismiss, 'BACK must leave the remote where it was').toBeFocused();
});
