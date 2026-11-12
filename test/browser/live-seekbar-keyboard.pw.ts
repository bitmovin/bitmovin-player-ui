import { expect, mountUi, test } from './harness';

// The harness mounts the UI while a live source is already loaded, the same as creating the UI manager after
// `player.load()`. The seek bar has to be detected as live during configuration, not only on a later live change.
test('live seek bar time-shifts with the keyboard when the UI is mounted while a live source is loaded', async ({
  page,
}) => {
  const ui = await mountUi(page, { live: true });
  const seekBar = page.getByRole('slider', { name: 'Video timeline' });
  await expect(seekBar).toBeVisible();

  await seekBar.press('ArrowLeft');

  await expect.poll(() => ui.player.timeShift()).toBe(-1);
  await expect.poll(() => ui.player.currentTime(), 'a live seek bar must not seek').toBe(0);
  await expect(seekBar).toHaveAttribute('aria-valuetext', 'Timeshift Value: -1');

  await seekBar.press('End');

  await expect.poll(() => ui.player.timeShift()).toBe(0);
});

// A UI variant is configured the first time it becomes active, which can happen mid-stream.
test('live seek bar keeps time-shifting after switching to the small-screen variant mid-stream', async ({ page }) => {
  const ui = await mountUi(page, { live: true });
  await ui.player.resize(640);
  await expect(page.locator('.bmpui-ui-smallscreen')).toBeVisible();
  const seekBar = page.getByRole('slider', { name: 'Video timeline' });
  await expect(seekBar).toBeVisible();

  await seekBar.press('ArrowLeft');

  await expect.poll(() => ui.player.timeShift()).toBe(-1);

  await seekBar.press('Home');

  await expect.poll(() => ui.player.timeShift()).toBe(-100);

  await seekBar.press('End');

  await expect.poll(() => ui.player.timeShift()).toBe(0);
  await expect.poll(() => ui.player.currentTime(), 'a live seek bar must not seek').toBe(0);
});
