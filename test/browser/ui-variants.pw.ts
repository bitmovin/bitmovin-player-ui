import { expect, mountUi, test } from './harness';

test('small-screen UI mounts through the generic harness', async ({ page }) => {
  const ui = await mountUi(page, { factory: 'smallScreen' });

  await ui.player.tick(1);

  await expect(page.locator('.bmpui-ui-smallscreen')).toHaveCount(1);
});
