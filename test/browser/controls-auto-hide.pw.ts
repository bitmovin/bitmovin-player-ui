import { Locator, Page } from '@playwright/test';
import { expect, test } from './harness';
import { mountDefaultControlBarUi } from './helpers/control-bar';
import { mountTvUi } from './helpers/tv';

/**
 * The controls auto-hide during playback. They must not hide while a keyboard user has focus inside them, because the
 * focused control and its focus indicator would become invisible (WCAG 2.4.7, 2.4.11), and they must not hide while
 * the pointer rests on them (WCAG 1.4.13). The settings panel must not close itself while it is used (WCAG 2.2.1).
 *
 * Focus modality, focus/pointer boundary events and timers interacting across several components are not modeled
 * faithfully by jsdom, so these run in a real browser. Timers advance through Playwright's clock, never by sleeping.
 */

const UI_HIDE_DELAY = 2000;
// The default layouts keep the SettingsPanel default hide delay
const SETTINGS_PANEL_HIDE_DELAY = 5000;
// Assert the hidden state by class: hidden components fade out, so they stay visible for a moment after hiding
const HIDDEN = /bmpui-hidden/;

async function installClock(page: Page): Promise<void> {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
}

function controlBar(page: Page): Locator {
  return page.getByRole('region', { name: 'Video player controls' });
}

function settingsPanelOf(page: Page): Locator {
  // The panel has no role or name of its own; the player insights panel reuses its class
  return page.locator('.bmpui-ui-settings-panel:not(.bmpui-ui-player-insights-panel)');
}

/** Presses Tab until keyboard focus is inside the control bar, failing instead of looping forever. */
async function tabIntoControlBar(page: Page): Promise<void> {
  for (let presses = 0; presses < 20; presses++) {
    await page.keyboard.press('Tab');
    const focusInControlBar = await controlBar(page).evaluate(bar => bar.contains(document.activeElement));
    if (focusInControlBar) {
      return;
    }
  }
  throw new Error('Tab never moved focus into the control bar');
}

test('keyboard focus inside the control bar keeps the controls shown until it leaves them', async ({ page }) => {
  await installClock(page);
  await mountDefaultControlBarUi(page, { live: false, hideDelay: UI_HIDE_DELAY });

  await tabIntoControlBar(page);
  await expect(controlBar(page), 'focusing a control should reveal the controls').not.toHaveClass(HIDDEN);
  await page.clock.runFor(UI_HIDE_DELAY * 3);

  await expect(controlBar(page), 'the focused control must stay visible').not.toHaveClass(HIDDEN);

  // Move focus back out of the control bar, onto the video area in front of it
  await page.keyboard.press('Shift+Tab');
  await expect(controlBar(page).locator(':focus')).toHaveCount(0);
  await page.clock.runFor(UI_HIDE_DELAY + 100);

  await expect(controlBar(page), 'the controls hide again once focus has left them').toHaveClass(HIDDEN);
});

test('controls focused by a click still auto-hide once the pointer has left them', async ({ page }) => {
  await installClock(page);
  await mountDefaultControlBarUi(page, { live: false, hideDelay: UI_HIDE_DELAY });

  // Pause and resume, so the playback toggle ends up focused by the pointer while playing
  await controlBar(page).getByRole('button', { name: 'Pause' }).click();
  await controlBar(page).getByRole('button', { name: 'Play', exact: true }).click();
  await expect(controlBar(page).getByRole('button', { name: 'Pause' })).toBeFocused();

  // Rest the pointer on the video instead of the controls
  const player = await page.locator('#player').boundingBox();
  if (!player) throw new Error('the player must be laid out');
  await page.mouse.move(player.x + player.width / 2, player.y + 20);
  await page.clock.runFor(UI_HIDE_DELAY + 100);

  await expect(controlBar(page)).toHaveClass(HIDDEN);
});

test('the pointer resting on a control keeps the controls shown', async ({ page }) => {
  await installClock(page);
  await mountDefaultControlBarUi(page, { live: false, hideDelay: UI_HIDE_DELAY });

  await controlBar(page).getByRole('button', { name: 'Settings' }).hover();
  await page.clock.runFor(UI_HIDE_DELAY * 3);

  await expect(controlBar(page)).not.toHaveClass(HIDDEN);
});

test('the settings panel stays open while keyboard focus is inside it, even when the pointer passes over it', async ({
  page,
}) => {
  await installClock(page);
  await mountDefaultControlBarUi(page, {
    live: false,
    hideDelay: UI_HIDE_DELAY,
    videoQualities: [
      { id: '1080', label: '1080p' },
      { id: '720', label: '720p' },
    ],
  });
  const settingsPanel = settingsPanelOf(page);

  await controlBar(page).getByRole('button', { name: 'Settings' }).focus();
  await page.keyboard.press('Enter');
  await expect(settingsPanel).toBeVisible();
  await expect(settingsPanel.locator(':focus'), 'opening the panel should move focus into it').toHaveCount(1);

  // A pointer passing over the panel used to restart its hide delay, closing it with focus inside
  const panelBounds = await settingsPanel.boundingBox();
  if (!panelBounds) throw new Error('the settings panel must be laid out');
  await page.mouse.move(panelBounds.x + panelBounds.width / 2, panelBounds.y + panelBounds.height / 2);
  await page.mouse.move(panelBounds.x - 50, panelBounds.y - 50);
  await page.clock.runFor(SETTINGS_PANEL_HIDE_DELAY * 2);

  await expect(settingsPanel, 'the panel must not close while keyboard focus is inside').not.toHaveClass(HIDDEN);
  await expect(controlBar(page)).not.toHaveClass(HIDDEN);
});

test('the settings panel stays open while the pointer rests on it and closes after its delay once left', async ({
  page,
}) => {
  await installClock(page);
  await mountDefaultControlBarUi(page, { live: false, hideDelay: UI_HIDE_DELAY });
  const settingsPanel = settingsPanelOf(page);

  await controlBar(page).getByRole('button', { name: 'Settings' }).click();
  await expect(settingsPanel).toBeVisible();
  await settingsPanel.hover();
  await page.clock.runFor(SETTINGS_PANEL_HIDE_DELAY * 2);

  await expect(settingsPanel, 'the panel must not close under a resting pointer').not.toHaveClass(HIDDEN);

  const panelBounds = await settingsPanel.boundingBox();
  if (!panelBounds) throw new Error('the settings panel must be laid out');
  await page.mouse.move(panelBounds.x - 50, panelBounds.y - 50);
  await page.clock.runFor(SETTINGS_PANEL_HIDE_DELAY + 100);

  await expect(settingsPanel, 'the configured hide delay still closes an idle panel').toHaveClass(HIDDEN);
});

test('TV controls still auto-hide while remote focus stays in the control bar', async ({ page }) => {
  await installClock(page);
  await mountTvUi(page, { live: false, hideDelay: UI_HIDE_DELAY });

  await page.keyboard.press('ArrowDown');
  await expect(controlBar(page).locator(':focus'), 'the remote should move focus into the control bar').toHaveCount(1);
  await page.clock.runFor(UI_HIDE_DELAY + 100);

  await expect(controlBar(page)).toHaveClass(HIDDEN);
});
