import { Locator } from '@playwright/test';
import { expect, test } from './harness';
import { mountDefaultControlBarUi } from './helpers/control-bar';

/**
 * The glyph the live indicator renders in front of the LIVE text, or `hidden` when it is not shown.
 *
 * Read from the same element the accessible name belongs to, so a later CSS rule that hides or overrides the
 * indicator fails the test together with the name.
 */
async function indicatorShape(liveButton: Locator): Promise<string> {
  return liveButton.evaluate(element => {
    const indicator = getComputedStyle(element, '::before');
    return indicator.display === 'none' || indicator.visibility === 'hidden' ? 'hidden' : indicator.content;
  });
}

test('tells at the live edge and behind live apart by accessible name and indicator shape', async ({ page }) => {
  const ui = await mountDefaultControlBarUi(page, { live: true });
  const controls = page.getByRole('region', { name: 'Video player controls' });
  const atLiveEdge = controls.getByRole('button', { name: 'Live, at live edge', exact: true });
  const behindLive = controls.getByRole('button', { name: 'Live, behind live, jump to live edge', exact: true });
  await expect(atLiveEdge).toBeVisible();
  await expect.poll(() => indicatorShape(atLiveEdge)).toBe('"●"');

  await ui.player.timeShift(-30);

  await expect(behindLive).toBeVisible();
  await expect.poll(() => indicatorShape(behindLive)).toBe('"○"');

  await behindLive.click();

  await expect(atLiveEdge).toBeVisible();
  await expect.poll(() => indicatorShape(atLiveEdge)).toBe('"●"');
});
