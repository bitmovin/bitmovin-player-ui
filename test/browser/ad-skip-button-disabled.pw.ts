import { expect, mountUi, test } from './harness';
import { pressUntilFocused } from './helpers/keyboard';

const ADS_UI = '.bmpui-ui-uicontainer.bmpui-ui-ads';

test('ignores keyboard activation of the skip button until the ad is skippable', async ({ page }) => {
  const ui = await mountUi(page, { live: false });
  await ui.player.startLinearAd({ skippableAfter: 5 });
  const countdownButton = page.locator(ADS_UI).getByRole('button', { name: 'Skip ad in 5' });
  await expect(countdownButton).toBeDisabled();

  await pressUntilFocused(page, countdownButton, 'Tab');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');

  await expect(countdownButton).toBeFocused();
  expect(await ui.player.linearAdSkipRequests()).toBe(0);

  await ui.player.playTo(5);
  const skipButton = page.locator(ADS_UI).getByRole('button', { name: 'Skip', exact: true });
  await expect(skipButton).toBeEnabled();
  await expect(skipButton).toBeFocused();
  await page.keyboard.press('Enter');

  await expect.poll(() => ui.player.linearAdSkipRequests()).toBe(1);
  await expect(page.locator(ADS_UI)).toBeHidden();
});
