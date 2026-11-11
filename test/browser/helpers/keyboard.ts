import { Locator, Page } from '@playwright/test';

// More tab stops than any layout has, so a target that is never reached fails instead of looping.
const MAX_TAB_STOPS = 50;

/**
 * Presses `key` until `target` has keyboard focus, proving it is in the sequential focus order.
 *
 * Throws when the target is not reached, which a programmatic `focus()` cannot prove: that also
 * focuses elements with `tabindex="-1"`.
 */
export async function pressUntilFocused(page: Page, target: Locator, key: 'Tab' | 'Shift+Tab'): Promise<void> {
  for (let stop = 0; stop < MAX_TAB_STOPS; stop++) {
    if (await target.evaluate(element => element.matches(':focus'))) {
      return;
    }
    await page.keyboard.press(key);
  }
  throw new Error(`the target was not reached within ${MAX_TAB_STOPS} presses of ${key}`);
}
