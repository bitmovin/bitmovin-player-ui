import { Page } from '@playwright/test';
import { expect, MountedUi, test } from './harness';
import { mountTvUi } from './helpers/tv';

/**
 * Opening a TV list box with the remote and selecting an option in it.
 *
 * None of this is observable in jsdom: whether a key the UI handled still reaches the platform's
 * native key handling, and where real focus is when the list box opens, needs a real browser.
 */

// The subtitle list box toggle shares its accessible name with the Settings button, so it is
// located by its class.
const SUBTITLE_LIST_BOX_TOGGLE_BUTTON = '.bmpui-ui-subtitle-list-box-toggle-button';

async function openSubtitleListBoxWithRemote(page: Page): Promise<void> {
  for (const key of ['ArrowDown', 'ArrowDown', 'ArrowRight']) {
    await page.keyboard.press(key);
  }
  await expect(
    page.locator(SUBTITLE_LIST_BOX_TOGGLE_BUTTON),
    'the remote should reach the subtitle button',
  ).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('menuitemradio', { name: 'off' }),
    'the list box should focus its first option',
  ).toBeFocused();
}

/**
 * Records the keys whose `keydown` default action was not prevented.
 *
 * Platforms such as the Android WebView activate the focused element on an Enter whose default
 * action runs. Desktop Chromium does not do that for list box options, so the scenario checks the
 * key handling the platforms rely on instead of the resulting click.
 *
 * The listener runs in the capture phase on `window`, before the UI's own key handling, so stopping
 * the propagation cannot hide an event from it. `defaultPrevented` is only read once the dispatch has
 * finished.
 */
async function recordKeysWithDefaultAction(page: Page): Promise<() => Promise<string[]>> {
  const keyEvents = await page.evaluateHandle(() => {
    const events: KeyboardEvent[] = [];
    window.addEventListener('keydown', event => events.push(event), true);
    return events;
  });
  return () => keyEvents.evaluate(events => events.filter(event => !event.defaultPrevented).map(event => event.key));
}

async function mountTvUiWithActiveSubtitle(page: Page): Promise<MountedUi> {
  const ui = await mountTvUi(page, {
    live: false,
    subtitleTracks: [
      { id: 'en', label: 'English' },
      { id: 'de', label: 'Deutsch' },
    ],
  });
  await ui.player.enableSubtitle('en');
  return ui;
}

test('opening the subtitle list box with OK keeps the active subtitle track', async ({ page }) => {
  const ui = await mountTvUiWithActiveSubtitle(page);
  const keysWithDefaultAction = await recordKeysWithDefaultAction(page);

  await openSubtitleListBoxWithRemote(page);

  expect(await keysWithDefaultAction(), 'the keys that open the list box must not run their default action').toEqual(
    [],
  );
  expect(await ui.player.enabledSubtitles(), 'opening the list box must not select an option').toEqual(['en']);
  await expect(page.getByRole('menuitemradio', { name: 'English' })).toBeChecked();
});

test('OK selects the subtitle option the list box focuses when it opens', async ({ page }) => {
  const ui = await mountTvUiWithActiveSubtitle(page);
  await openSubtitleListBoxWithRemote(page);

  await page.keyboard.press('Enter');

  expect(await ui.player.enabledSubtitles(), 'OK on the focused "off" option should disable subtitles').toEqual([]);
});

test('each D-pad press moves the focus to the next subtitle option', async ({ page }) => {
  const ui = await mountTvUiWithActiveSubtitle(page);
  await openSubtitleListBoxWithRemote(page);

  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitemradio', { name: 'English' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitemradio', { name: 'Deutsch' })).toBeFocused();
  await page.keyboard.press('Enter');

  expect(await ui.player.enabledSubtitles(), 'OK should select the focused option').toEqual(['de']);
});
