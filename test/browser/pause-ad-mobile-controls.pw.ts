import { expect, mountUi, test } from './harness';

test('a mobile pause ad keeps touch seeking available and hides only its centered playback button', async ({
  page,
}) => {
  const ui = await mountUi(page, { factory: 'smallScreen', live: false, mobile: true });
  const touchOverlay = page.locator('.bmpui-ui-touch-control-overlay');
  const centeredPlaybackButton = touchOverlay.locator('.bmpui-ui-smallcenteredplaybacktogglebutton');

  await expect(touchOverlay, 'the mobile layout should use the touch overlay').toBeVisible();

  await ui.player.startPauseAd();

  await expect(touchOverlay, 'touch seeking must remain available during a pause ad').toBeVisible();
  await expect(centeredPlaybackButton, 'only the centered playback button should be suppressed').toBeHidden();
});
