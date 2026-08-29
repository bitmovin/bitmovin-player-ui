import { controlBarFlexRows, controlBarWidths, expect, mountUi, test, tick } from './harness';

/**
 * The four host/stream combinations every layout invariant here runs against.
 *
 * `hostReset` is the bigger axis of the two. Most real pages ship a global `box-sizing: border-box`
 * reset and plenty do not, and a reset masks exactly the class of bug this suite exists for. Live
 * and VOD differ because the live label carries padding the VOD one does not.
 */
const environments = [false, true].flatMap(hostReset =>
  [true, false].map(live => ({
    hostReset,
    live,
    name: `${live ? 'live' : 'vod'}, host page ${hostReset ? 'with a global border-box reset' : 'with no CSS reset'}`,
  })),
);

/**
 * Time updates must not resize the control bar.
 *
 * Regression cover for the 4.18.0 bug where `PlaybackTimeLabel` fed its own `offsetWidth` back into
 * `min-width`. With padding present and `content-box` in effect, every update wrote back a larger
 * value, so the label grew and the seek bar next to it shrank to nothing.
 *
 * Deliberately not written against `PlaybackTimeLabel`: the invariant is that no control bar child
 * changes size when only the clock moves, which also covers whatever causes this next time.
 *
 * The baseline is taken after the first tick, not at mount. `PlaybackTimeLabel` is designed to grow
 * its `min-width` up to the width of its content once, so the first update legitimately settles the
 * size; everything after it must not move.
 */
test.describe('control bar geometry is stable under time updates', () => {
  for (const { name, live, hostReset } of environments) {
    test(name, async ({ page }) => {
      await mountUi(page, { live, hostReset });

      await tick(page, 1);
      const before = await controlBarWidths(page);
      expect(Object.keys(before).length).toBeGreaterThan(0);

      await tick(page, 50);

      expect(await controlBarWidths(page)).toEqual(before);
    });
  }
});

/**
 * Nothing in the control bar may take more room than the row it sits in.
 *
 * The stability test above only says sizes hold still; it is equally happy with a layout that is
 * broken and stays broken. This one says the layout is not broken in the first place.
 */
test.describe('control bar rows contain their children', () => {
  for (const { name, live, hostReset } of environments) {
    test(name, async ({ page }) => {
      await mountUi(page, { live, hostReset });
      await tick(page, 50);

      const rows = await controlBarFlexRows(page);
      // Without this the test passes when the selectors stop matching anything.
      expect(rows.length, 'no horizontal flex rows found in the control bar').toBeGreaterThan(0);

      // A sub-pixel rounding allowance, not a layout budget: flex distributes fractional space, so
      // summing the parts can land a hair over the whole through float addition alone. Anything a
      // human could see is orders of magnitude larger than this.
      const overflowing = rows.filter(row => row.used > row.available + 0.5);

      expect(overflowing).toEqual([]);
    });
  }
});
