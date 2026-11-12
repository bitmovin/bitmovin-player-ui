import { Page } from '@playwright/test';
import { expect, MountOptions, mountUi, test } from './harness';
import { mountDefaultControlBarUi } from './helpers/control-bar';
import { mountTvUi } from './helpers/tv';

/**
 * The settings panel and the context menu are rendered at the end of the UI, far from the controls that open them.
 * Keyboard focus has to follow them there and come back again (WCAG 2.4.3), which only a real browser shows: Tab
 * order, focus loss when an element becomes hidden, and the `:focus` state are not modeled faithfully by jsdom.
 */

const VIDEO_QUALITIES = [
  { id: 'video-1', label: 'HD' },
  { id: 'video-2', label: 'SD' },
];

const layouts: { name: string; mount: (page: Page) => Promise<unknown> }[] = [
  { name: 'default', mount: page => mountDefaultControlBarUi(page, { live: false, videoQualities: VIDEO_QUALITIES }) },
  {
    name: 'small screen',
    mount: page => mountUi(page, { factory: 'smallScreen', live: false, videoQualities: VIDEO_QUALITIES }),
  },
];

function settingsPanel(page: Page) {
  return page.locator('.bmpui-ui-settings-panel:not(.bmpui-ui-context-menu):not(.bmpui-ui-player-insights-panel)');
}

async function openSettingsWithKeyboard(page: Page) {
  const settingsButton = page.getByRole('button', { name: 'Settings' });
  await settingsButton.focus();
  await page.keyboard.press('Enter');
  await expect(settingsPanel(page)).toBeVisible();
  return settingsButton;
}

for (const layout of layouts) {
  test(`${layout.name}: Settings opened with the keyboard takes focus and returns it on Escape`, async ({ page }) => {
    await layout.mount(page);

    const settingsButton = await openSettingsWithKeyboard(page);
    await expect(
      settingsPanel(page).getByRole('menuitem', { name: /Quality/ }),
      'focus should move into the opened panel',
    ).toBeFocused();

    await page.keyboard.press('Escape');

    await expect(settingsPanel(page)).toBeHidden();
    await expect(settingsButton, 'closing the panel should return focus to the Settings button').toBeFocused();
  });
}

test('Tab past the last Settings item continues after the Settings button and closes the panel', async ({ page }) => {
  // Fullscreen is the control after Settings, but the default layout hides it while unavailable.
  await mountDefaultControlBarUi(page, { live: false, videoQualities: VIDEO_QUALITIES, fullscreenAvailable: true });
  await openSettingsWithKeyboard(page);

  await page.keyboard.press('Tab');
  await expect(settingsPanel(page).getByRole('menuitem', { name: /Speed/ })).toBeFocused();
  await page.keyboard.press('Tab');

  await expect(
    page.getByRole('button', { name: 'Fullscreen' }),
    'Tab should continue with the control after Settings instead of leaving the player',
  ).toBeFocused();
  await expect(settingsPanel(page)).toBeHidden();
});

test('Shift+Tab on the first Settings item returns to the Settings button and closes the panel', async ({ page }) => {
  await mountDefaultControlBarUi(page, { live: false, videoQualities: VIDEO_QUALITIES });
  const settingsButton = await openSettingsWithKeyboard(page);

  await page.keyboard.press('Shift+Tab');

  await expect(settingsButton).toBeFocused();
  await expect(settingsPanel(page)).toBeHidden();
});

test('going back from a Settings sub-page focuses the item that opened it', async ({ page }) => {
  await mountDefaultControlBarUi(page, { live: false, videoQualities: VIDEO_QUALITIES });
  await openSettingsWithKeyboard(page);
  // Not the first item, so returning to it is distinguishable from the default focus of the page.
  const speedItem = settingsPanel(page).getByRole('menuitem', { name: /Speed/ });
  await page.keyboard.press('Tab');
  await expect(speedItem).toBeFocused();
  await page.keyboard.press('Enter');
  const backButton = settingsPanel(page).getByRole('button', { name: 'Speed' });
  await expect(backButton, 'the Speed sub-page should be open').toBeVisible();

  await backButton.focus();
  await page.keyboard.press('Enter');

  await expect(speedItem, 'focus should return to the item that opened the sub-page').toBeFocused();
});

test('closing Settings with the mouse leaves focus where the mouse put it', async ({ page }) => {
  await mountDefaultControlBarUi(page, { live: false, videoQualities: VIDEO_QUALITIES });
  const settingsButton = page.getByRole('button', { name: 'Settings' });
  await settingsButton.click();
  await expect(settingsPanel(page)).toBeVisible();

  // Click the empty video area next to the panel, which dismisses it.
  await page.mouse.click(100, 100);

  await expect(settingsPanel(page)).toBeHidden();
  await expect(settingsButton, 'a mouse dismissal must not pull focus back to the Settings button').not.toBeFocused();
});

test('closing the context menu returns focus to the control it was opened from', async ({ page }) => {
  await mountDefaultControlBarUi(page, { live: false });
  const pauseButton = page
    .getByRole('region', { name: 'Video player controls' })
    .getByRole('button', { name: 'Pause' });
  const contextMenu = page.locator('.bmpui-ui-context-menu');
  await pauseButton.focus();

  // What the browser fires for the Menu key or Shift+F10 on the focused control.
  await pauseButton.dispatchEvent('contextmenu');
  await expect(contextMenu).toBeVisible();
  await expect(
    contextMenu.getByRole('menuitem', { name: 'Show Player Insights' }),
    'focus should move into the opened menu',
  ).toBeFocused();

  await page.keyboard.press('Escape');

  await expect(contextMenu).toBeHidden();
  await expect(pauseButton, 'closing the menu should return focus to where it was').toBeFocused();
});

test('dismissing the context menu with the mouse leaves focus where the mouse put it', async ({ page }) => {
  await mountDefaultControlBarUi(page, { live: false });
  const pauseButton = page
    .getByRole('region', { name: 'Video player controls' })
    .getByRole('button', { name: 'Pause' });
  const contextMenu = page.locator('.bmpui-ui-context-menu');
  await pauseButton.focus();
  await pauseButton.dispatchEvent('contextmenu');
  await expect(contextMenu).toBeVisible();

  // The menu opens at the top left corner for a keyboard-triggered event, so click the empty video area below it.
  await page.mouse.click(500, 300);

  await expect(contextMenu).toBeHidden();
  await expect(pauseButton, 'a mouse dismissal must not pull focus back to the control').not.toBeFocused();
});

test('TV: going back from a Settings sub-page focuses the item that opened it', async ({ page }) => {
  const options: Omit<MountOptions, 'factory'> = { live: false, videoQualities: VIDEO_QUALITIES };
  await mountTvUi(page, options);
  const tvSettingsPanel = page.locator('.bmpui-ui-settings-panel:not(.bmpui-ui-listbox)');
  const qualityItem = tvSettingsPanel.getByRole('menuitem', { name: /Quality/ });
  const speedItem = tvSettingsPanel.getByRole('menuitem', { name: /Speed/ });

  for (const key of ['ArrowDown', 'ArrowDown', 'ArrowRight']) {
    await page.keyboard.press(key);
  }
  await expect(page.getByRole('button', { name: 'Settings' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(qualityItem).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(speedItem).toBeFocused();
  await page.keyboard.press('Enter');
  // The remote lands on the back button of the sub-page.
  await expect(tvSettingsPanel.getByRole('button', { name: 'Speed' })).toBeFocused();

  await page.keyboard.press('Enter');

  await expect(speedItem, 'focus should return to the item that opened the sub-page').toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(qualityItem, 'the remote should continue from the restored item').toBeFocused();
});
