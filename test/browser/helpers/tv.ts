import { Page } from '@playwright/test';
import { expect, MountOptions, MountedUi, mountUi } from '../harness';

/**
 * Mounts the TV layout and asserts it actually laid out before a spec measures or navigates it.
 *
 * `buildTvUI` picks between the TV and TV-ads variants, so a spec that navigates the TV control bar
 * needs to know it got the one with a seek bar and a settings button. These readiness checks stay
 * here rather than in `mountUi` so other layouts do not inherit a dependency on the TV DOM.
 */
export async function mountTvUi(page: Page, options: Omit<MountOptions, 'factory'> = {}): Promise<MountedUi> {
  const ui = await mountUi(page, { ...options, factory: 'tv' });

  const mounted = await page.evaluate(() => {
    const container = document.querySelector('.bmpui-ui-uicontainer');
    const seekBar = document.querySelector('.bmpui-ui-controlbar .bmpui-ui-seekbar');
    return {
      isTvVariant: Boolean(container?.classList.contains('bmpui-ui-tv')),
      seekBarWidth: seekBar ? (seekBar as HTMLElement).offsetWidth : 0,
    };
  });

  expect(mounted.isTvVariant, 'the TV layout should be the resolved variant').toBe(true);
  expect(mounted.seekBarWidth, 'the TV UI has to actually lay out, or nothing below asserts anything').toBeGreaterThan(
    0,
  );

  return ui;
}

/**
 * Identifies the focused control well enough for a failure message to name it.
 *
 * Throws rather than answering with an empty string when nothing is focused: an empty value would
 * compare equal between two runs and turn a focus assertion into a test that cannot fail.
 */
export async function focusedControlName(page: Page): Promise<string> {
  return page.evaluate(() => {
    const active = document.activeElement;
    if (!active || active === document.body) {
      throw new Error('no control is focused');
    }
    return Array.from(active.classList).join('.') || active.tagName.toLowerCase();
  });
}
