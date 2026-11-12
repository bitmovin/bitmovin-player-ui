import { Page } from '@playwright/test';
import { expect, mountUi, test } from './harness';
import { mountTvUi } from './helpers/tv';

/**
 * Settings pages and the context menu are exposed as ARIA menus, so keyboard and screen reader users
 * expect the WAI-ARIA menu keys: the arrow keys move between items and wrap, Home and End jump to the
 * first and last item. Focus movement and the accessibility tree are only observable in a real browser.
 */

const VIDEO_QUALITIES = [
  { id: '1080', label: '1080p' },
  { id: '720', label: '720p' },
];

async function openSettings(page: Page) {
  await page.getByRole('button', { name: 'Settings' }).click();
  const settingsMenu = page.getByRole('menu', { name: 'Settings' });
  await expect(settingsMenu).toBeVisible();
  return settingsMenu;
}

async function openVideoQualityMenu(page: Page) {
  const settingsMenu = await openSettings(page);
  await settingsMenu.getByRole('menuitem', { name: /Video Quality/ }).press('Enter');
  const qualityMenu = page.getByRole('menu', { name: 'Video Quality' });
  await expect(qualityMenu).toBeVisible();
  return qualityMenu;
}

test('arrow keys, Home and End move focus between the settings menu items and wrap', async ({ page }) => {
  await mountUi(page, { live: false, videoQualities: VIDEO_QUALITIES });
  const settingsMenu = await openSettings(page);
  const quality = settingsMenu.getByRole('menuitem', { name: /Video Quality/ });
  const speed = settingsMenu.getByRole('menuitem', { name: /Speed/ });
  await quality.focus();

  await page.keyboard.press('ArrowDown');
  await expect(speed).toBeFocused();

  await page.keyboard.press('ArrowDown');
  await expect(quality, 'ArrowDown on the last item should wrap to the first').toBeFocused();

  await page.keyboard.press('ArrowUp');
  await expect(speed, 'ArrowUp on the first item should wrap to the last').toBeFocused();

  await page.keyboard.press('Home');
  await expect(quality).toBeFocused();

  await page.keyboard.press('End');
  await expect(speed).toBeFocused();
});

test('a settings sub page exposes its title row as a named menu, not as a menu item', async ({ page }) => {
  await mountUi(page, { live: false, videoQualities: VIDEO_QUALITIES });

  const qualityMenu = await openVideoQualityMenu(page);

  // The title row used to be a menuitem wrapping a button. Now the menu is named after the title and the
  // back button is the only menu item in that row.
  await expect(qualityMenu).toMatchAriaSnapshot(`
    - menu "Video Quality":
      - menuitem "Video Quality"
      - menuitemradio "auto" [checked=false]
      - menuitemradio "1080p" [checked=false]
      - menuitemradio "720p" [checked=false]
  `);
});

test('the keyboard selects a quality option and aria-checked follows the selection', async ({ page }) => {
  await mountUi(page, { live: false, videoQualities: VIDEO_QUALITIES });
  const qualityMenu = await openVideoQualityMenu(page);
  const back = qualityMenu.getByRole('menuitem', { name: 'Video Quality' });
  const auto = qualityMenu.getByRole('menuitemradio', { name: 'auto' });
  const hd = qualityMenu.getByRole('menuitemradio', { name: '1080p' });
  const sd = qualityMenu.getByRole('menuitemradio', { name: '720p' });
  await auto.focus();

  await page.keyboard.press('ArrowDown');
  await expect(hd).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(hd).toHaveAttribute('aria-checked', 'true');
  await expect(auto).toHaveAttribute('aria-checked', 'false');
  await expect(sd).toHaveAttribute('aria-checked', 'false');

  await page.keyboard.press('End');
  await expect(sd).toBeFocused();
  await page.keyboard.press('Space');

  await expect(sd).toHaveAttribute('aria-checked', 'true');
  await expect(hd).toHaveAttribute('aria-checked', 'false');

  await page.keyboard.press('Home');
  await expect(back, 'Home should reach the back button in the title row').toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(sd, 'ArrowUp on the first item should wrap to the last').toBeFocused();
});

test('Escape closes the settings menu from a sub page', async ({ page }) => {
  await mountUi(page, { live: false, videoQualities: VIDEO_QUALITIES });
  const qualityMenu = await openVideoQualityMenu(page);
  await qualityMenu.getByRole('menuitemradio', { name: '1080p' }).focus();

  await page.keyboard.press('Escape');

  await expect(qualityMenu).toBeHidden();
  await expect(page.getByRole('menu', { name: 'Settings' })).toBeHidden();
});

test('arrow keys move focus between the context menu items and Escape closes it', async ({ page }) => {
  await mountUi(page, { live: false });
  await page.locator('.bmpui-ui-uicontainer').click({ button: 'right', position: { x: 300, y: 200 } });
  const contextMenu = page.getByRole('menu', { name: 'Bitmovin Player' });
  await expect(contextMenu).toBeVisible();
  await expect(contextMenu.getByRole('menu'), 'the context menu must not nest a menu in a menu').toHaveCount(0);
  const insights = contextMenu.getByRole('menuitem', { name: 'Show Player Insights' });
  const copyLink = contextMenu.getByRole('menuitem', { name: 'Copy link at current time' });
  await insights.focus();

  await page.keyboard.press('ArrowDown');
  await expect(copyLink).toBeFocused();

  await page.keyboard.press('ArrowDown');
  await expect(insights, 'ArrowDown on the last item should wrap to the first').toBeFocused();

  await page.keyboard.press('ArrowUp');
  await expect(copyLink, 'ArrowUp on the first item should wrap to the last').toBeFocused();

  await page.keyboard.press('Escape');
  await expect(contextMenu).toBeHidden();
});

test('on TV, spatial navigation alone moves remote focus one item per key press', async ({ page }) => {
  await mountTvUi(page, { live: false, videoQualities: VIDEO_QUALITIES });
  const settingsMenu = await openSettings(page);
  await expect(settingsMenu.getByRole('menuitem', { name: /Video Quality/ })).toBeFocused();
  await page.keyboard.press('Enter');
  const qualityMenu = page.getByRole('menu', { name: 'Video Quality' });
  const back = qualityMenu.getByRole('menuitem', { name: 'Video Quality' });
  const options = qualityMenu.getByRole('menuitemradio');
  await expect(back, 'spatial navigation should focus the first control of the sub page').toBeFocused();

  // A second handler for the same key press would skip an option or wrap around
  for (const option of [options.nth(0), options.nth(1), options.nth(2)]) {
    await page.keyboard.press('ArrowDown');
    await expect(option).toBeFocused();
  }

  // Spatial navigation stops at the edge instead of wrapping like the desktop menu keys
  await page.keyboard.press('ArrowDown');
  await expect(options.nth(2)).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(options.nth(2)).toHaveAttribute('aria-checked', 'true');
});

test('on TV, End then Enter selects the option that End focused', async ({ page }) => {
  await mountTvUi(page, { live: false, videoQualities: VIDEO_QUALITIES });
  await openSettings(page);
  await page.keyboard.press('Enter');
  const qualityMenu = page.getByRole('menu', { name: 'Video Quality' });
  const back = qualityMenu.getByRole('menuitem', { name: 'Video Quality' });
  const lastOption = qualityMenu.getByRole('menuitemradio', { name: '720p' });
  await expect(back).toBeFocused();

  await page.keyboard.press('End');
  await expect(lastOption).toBeFocused();
  await page.keyboard.press('Enter');

  // Remote navigation must activate the focused option, not the item it last moved to itself
  await expect(lastOption).toHaveAttribute('aria-checked', 'true');
  await expect(qualityMenu, 'the back button must not have been activated').toBeVisible();
});

test('on TV, ArrowDown after Home continues from the item that Home focused', async ({ page }) => {
  await mountTvUi(page, { live: false, videoQualities: VIDEO_QUALITIES });
  await openSettings(page);
  await page.keyboard.press('Enter');
  const qualityMenu = page.getByRole('menu', { name: 'Video Quality' });
  const back = qualityMenu.getByRole('menuitem', { name: 'Video Quality' });
  const options = qualityMenu.getByRole('menuitemradio');
  await expect(back).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(options.nth(1)).toBeFocused();

  await page.keyboard.press('Home');
  await expect(back).toBeFocused();
  await page.keyboard.press('ArrowDown');

  await expect(options.nth(0)).toBeFocused();
});

test('arrow keys reach interactive rows outside the tab order and skip hidden controls in custom layouts', async ({
  page,
}) => {
  await mountUi(page, { factory: 'customSettingsPanel' });
  const settingsMenu = await openSettings(page);
  const interactiveRow = settingsMenu.getByRole('menuitem', { name: 'Interactive row' });
  const speedSelect = settingsMenu.getByRole('combobox');
  await expect(settingsMenu.getByRole('button', { name: 'Hidden action' })).toBeHidden();
  await interactiveRow.focus();

  await page.keyboard.press('ArrowDown');
  await expect(speedSelect, 'the hidden button in front of the select must not take the focus').toBeFocused();

  await interactiveRow.focus();
  await page.keyboard.press('ArrowUp');
  await expect(speedSelect, 'ArrowUp on the first item should wrap to the last').toBeFocused();
});
