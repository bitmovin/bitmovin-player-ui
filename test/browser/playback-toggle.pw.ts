import { expect, test } from './harness';
import { mountDefaultControlBarUi } from './helpers/control-bar';

test('playback toggle reflects player state after user interaction', async ({ page }) => {
  await mountDefaultControlBarUi(page, { live: false });
  const controls = page.getByRole('region', { name: 'Video player controls' });
  const pauseButton = controls.getByRole('button', { name: 'Pause' });
  await expect(pauseButton).toBeVisible();

  await pauseButton.click();

  const playButton = controls.getByRole('button', { name: 'Play', exact: true });
  await expect(playButton).toBeVisible();

  await playButton.click();

  await expect(controls.getByRole('button', { name: 'Pause' })).toBeVisible();
});
