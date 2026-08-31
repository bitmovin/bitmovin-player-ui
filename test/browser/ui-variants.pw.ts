import { expect, mountUi, test } from './harness';

test('small-screen UI mounts through the generic harness', async ({ page }) => {
  await mountUi(page, { factory: 'smallScreen' });

  await expect(page.locator('.bmpui-ui-smallscreen')).toHaveCount(1);
});

test('unsupported UI factories fail instead of mounting the default UI', async ({ page }) => {
  await expect(mountUi(page, { factory: 'unsupported' as never })).rejects.toThrow('unsupported UI factory');
});
