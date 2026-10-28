import { expect, mountUi, test } from './harness';

test('UI initialises and renders on platforms without a ShadowRoot global', async ({ page }) => {
  const ui = await mountUi(page, { withoutShadowRoot: true, live: false });
  expect(await page.evaluate(() => typeof ShadowRoot), 'the platform must not provide ShadowRoot').toBe('undefined');

  await ui.player.enterCue('Subtitle without Shadow DOM');

  await expect(page.locator('.bmpui-ui-uicontainer .bmpui-ui-subtitle-label')).toHaveText(
    'Subtitle without Shadow DOM',
  );
});
