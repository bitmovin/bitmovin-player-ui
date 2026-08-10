import { expect, test } from '@playwright/test';
import { controlBarWidths, mountUi, tick } from './harness';

/**
 * Time updates must not resize the control bar.
 *
 * Regression cover for the 4.18.0 bug where `PlaybackTimeLabel` fed its own `offsetWidth` back into
 * `min-width`. With padding present and `content-box` in effect, every update wrote back a larger
 * value, so the label grew and the seek bar next to it shrank to nothing.
 *
 * Deliberately not written against `PlaybackTimeLabel`: the invariant is that no control bar child
 * changes size when only the clock moves, which also covers whatever causes this next time.
 */
test.describe('control bar geometry is stable under time updates', () => {
  for (const hostReset of [false, true]) {
    const host = hostReset ? 'host page with a global border-box reset' : 'host page with no CSS reset';

    test(`live, ${host}`, async ({ page }) => {
      await mountUi(page, { live: true, hostReset });

      await tick(page, 1);
      const before = await controlBarWidths(page);
      expect(Object.keys(before).length).toBeGreaterThan(0);

      await tick(page, 50);
      const after = await controlBarWidths(page);

      expect(after).toEqual(before);
    });
  }

  test('vod, host page with no CSS reset', async ({ page }) => {
    await mountUi(page, { live: false, hostReset: false });

    await tick(page, 1);
    const before = await controlBarWidths(page);
    await tick(page, 50);

    expect(await controlBarWidths(page)).toEqual(before);
  });

  test('control bar children never overflow their row', async ({ page }) => {
    await mountUi(page, { live: true });
    await tick(page, 50);

    // Only the horizontal control rows, not the wrappers around them: a wrapper stacks its rows
    // vertically, so summing its children's widths is meaningless.
    const overflowing = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.bmpui-controlbar-top, .bmpui-controlbar-bottom'))
        .map(row => ({
          row: row.className.split(' ')[0],
          children: Array.from(row.children)
            .filter(c => getComputedStyle(c).position !== 'absolute')
            .reduce((sum, c) => sum + (c as HTMLElement).offsetWidth, 0),
          available: (row as HTMLElement).clientWidth,
        }))
        .filter(r => r.available > 0 && r.children > r.available),
    );

    expect(overflowing).toEqual([]);
  });
});
