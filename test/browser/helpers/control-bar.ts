import { Page } from '@playwright/test';
import { expect, MountOptions, MountedUi, mountUi } from '../harness';

export async function mountDefaultControlBarUi(
  page: Page,
  options: Omit<MountOptions, 'factory'> = {},
): Promise<MountedUi> {
  const ui = await mountUi(page, { ...options, factory: 'default' });
  // Everything below measures the control bar DOM, so a missing or half-built default layout
  // would make geometry assertions pass vacuously. Keep these feature-specific checks out of the
  // generic mount path so other UIFactory layouts remain testable.
  const mounted = await page.evaluate(() => {
    const containers = Array.from(document.querySelectorAll('.bmpui-ui-uicontainer'));
    const seekBar = document.querySelector('.bmpui-ui-controlbar .bmpui-ui-seekbar');
    const otherVariants = ['ads', 'smallscreen', 'tv', 'cast-receiver'].map(name => `bmpui-ui-${name}`);
    return {
      variantMarkers: containers.flatMap(container =>
        otherVariants.filter(marker => container.classList.contains(marker)),
      ),
      controlBars: document.querySelectorAll('.bmpui-ui-controlbar').length,
      controlRows: document.querySelectorAll('.bmpui-controlbar-top, .bmpui-controlbar-bottom').length,
      seekBarWidth: seekBar ? (seekBar as HTMLElement).offsetWidth : 0,
    };
  });

  expect(mounted.variantMarkers, 'the main layout should be the resolved variant').toEqual([]);
  expect(mounted.controlBars, 'the mounted variant should contain exactly one control bar').toBe(1);
  expect(mounted.controlRows, 'the control bar should contain at least one row to measure').toBeGreaterThan(0);
  expect(mounted.seekBarWidth, 'the UI has to actually lay out, or nothing below asserts anything').toBeGreaterThan(0);

  return ui;
}

/**
 * Width of every element inside the control bar, keyed by DOM position and class.
 *
 * Measures all descendants, not just the rows: the rows are full-width by construction, so
 * comparing only those would pass no matter how badly the controls inside them resized.
 *
 * Uses `offsetWidth` deliberately, where {@link controlBarFlexRows} uses `getBoundingClientRect()`.
 * This is an exact-equality snapshot of two measurements taken from the same layout, so integer
 * widths are all it needs; a comparison between two *different* quantities needs the sub-pixel
 * value instead. Do not unify them without re-checking what each assertion can still detect.
 */
export async function controlBarWidths(page: Page): Promise<Record<string, number>> {
  return page.evaluate(() => {
    const widths: Record<string, number> = {};
    const bar = document.querySelector('.bmpui-ui-controlbar');
    // Throw rather than return `{}`: an empty result compares equal to the next empty result, so a
    // missing control bar would turn a stability assertion into a test that always passes.
    if (!bar) throw new Error('no .bmpui-ui-controlbar in the document');

    const walk = (element: Element, pathPrefix: string) => {
      Array.from(element.children).forEach((child, index) => {
        const cls = child.classList[0] || child.tagName.toLowerCase();
        const key = `${pathPrefix}${index}:${cls}`;
        widths[key] = (child as HTMLElement).offsetWidth;
        walk(child, `${key} > `);
      });
    };
    walk(bar, '');
    return widths;
  });
}

export interface FlexRow {
  /** First CSS class of the flex container, enough to identify it in a failure message. */
  row: string;
  /** Total width its laid-out children occupy, margins included. */
  used: number;
  /** Content-box width available to them. */
  available: number;
}

/**
 * Every non-wrapping horizontal flex container inside the control bar, with the space its children
 * occupy and the space it has.
 *
 * Explicitly *not* `.bmpui-controlbar-top` / `.bmpui-controlbar-bottom`: those rows hold a single
 * full-width `container-wrapper` child, so summing their children can never exceed them no matter
 * how badly the controls inside resize. The flex containers that actually distribute space are one
 * level further down, and buttons, the seek bar and the volume slider are flex rows of their own.
 *
 * Measured with `getBoundingClientRect()` rather than `offsetWidth`, because `offsetWidth` rounds
 * to whole pixels and the rounding alone can push a row a pixel over its parent.
 */
export async function controlBarFlexRows(page: Page): Promise<FlexRow[]> {
  return page.evaluate(() => {
    const bar = document.querySelector('.bmpui-ui-controlbar');
    if (!bar) throw new Error('no .bmpui-ui-controlbar in the document');

    const rows: FlexRow[] = [];

    // A `NaN` anywhere in the arithmetic below makes every `used > available` comparison false, so
    // an unparseable length would silently turn this into a test that cannot fail.
    const px = (value: string) => {
      const parsed = parseFloat(value);
      if (!Number.isFinite(parsed)) throw new Error(`expected a pixel length, got "${value}"`);
      return parsed;
    };

    // `column-gap` computes to the keyword `normal` when unset, which flexbox resolves to zero.
    // Every other value is a length, and an unexpected one must still be loud rather than NaN.
    const gap = (value: string) => (value === 'normal' ? 0 : px(value));

    const walk = (element: Element) => {
      const style = getComputedStyle(element);
      const isHorizontalFlex =
        (style.display === 'flex' || style.display === 'inline-flex') &&
        style.flexDirection.startsWith('row') &&
        style.flexWrap === 'nowrap';

      if (isHorizontalFlex) {
        // Out-of-flow children (the seek bar label, tooltips) are positioned against the row and are
        // supposed to be able to exceed it. Only in-flow children compete for the row's width.
        const inFlow = Array.from(element.children).filter(child => {
          const childStyle = getComputedStyle(child);
          return childStyle.display !== 'none' && childStyle.position !== 'absolute' && childStyle.position !== 'fixed';
        });

        if (inFlow.length > 0) {
          // Gaps occupy the row just as the children do. Omitting them understates `used` by
          // `(children - 1) * gap`, which is a window in which a row can overflow and still pass.
          const used =
            inFlow.reduce((sum, child) => {
              const childStyle = getComputedStyle(child);
              return sum + child.getBoundingClientRect().width + px(childStyle.marginLeft) + px(childStyle.marginRight);
            }, 0) +
            (inFlow.length - 1) * gap(style.columnGap);

          // Children lay out in the content box, so padding is not theirs to use.
          const available =
            element.getBoundingClientRect().width -
            px(style.paddingLeft) -
            px(style.paddingRight) -
            px(style.borderLeftWidth) -
            px(style.borderRightWidth);

          rows.push({ row: element.classList[0] || element.tagName.toLowerCase(), used, available });
        }
      }

      Array.from(element.children).forEach(walk);
    };

    walk(bar);
    return rows;
  });
}
