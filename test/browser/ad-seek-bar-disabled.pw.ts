import { expect, mountUi, test } from './harness';

// The main UI stays in the DOM, hidden, while the ads UI is active. Scope to the ads UI so the
// locator cannot resolve to the content seek bar.
const ADS_UI = '.bmpui-ui-uicontainer.bmpui-ui-ads';

test('exposes the seek bar as disabled during a linear ad and ignores seek keys', async ({ page }) => {
  const ui = await mountUi(page, { live: false });
  await ui.player.startLinearAd();
  const adSeekBar = page.locator(ADS_UI).getByRole('slider', { name: /Video timeline/ });
  await expect(adSeekBar).toBeVisible();

  await adSeekBar.focus();
  await adSeekBar.press('ArrowRight');
  await adSeekBar.press('End');

  await expect(adSeekBar).toBeFocused();
  await expect(adSeekBar).toBeDisabled();
  expect(await ui.player.currentTime()).toBe(0);
});

test('enables the seek bar again after the ad break', async ({ page }) => {
  const ui = await mountUi(page, { live: false });
  await ui.player.startLinearAd();
  await expect(page.locator(ADS_UI)).toBeVisible();

  await ui.player.finishLinearAd();

  const seekBar = page.getByRole('slider', { name: /Video timeline/ });
  await expect(seekBar).toBeEnabled();
  await seekBar.focus();
  await seekBar.press('ArrowRight');
  await expect.poll(() => ui.player.currentTime()).toBe(1);
});
