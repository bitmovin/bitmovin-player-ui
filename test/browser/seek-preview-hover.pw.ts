import { Locator, Page } from '@playwright/test';
import { expect, MountedUi, test } from './harness';
import { mountDefaultControlBarUi } from './helpers/control-bar';
import { mountTvUi } from './helpers/tv';

// Short enough that resting past it is part of every scenario, so the controls' own auto-hide is active.
const HIDE_DELAY = 2_000;
// A deliberately slow pointer (50 px/s), so crossing from the seek bar onto the preview does not rely on a fast hand.
const SLOW_POINTER_MS_PER_PX = 20;
// The stub player's VOD duration.
const DURATION = 600;

const LAYOUTS = [
  { name: 'default', mount: mountDefaultControlBarUi },
  { name: 'TV', mount: mountTvUi },
] as const;

async function mountPlayingUi(page: Page, mount: (typeof LAYOUTS)[number]['mount']): Promise<MountedUi> {
  // The controls hide on a timer, so the clock is driven by the test instead of passing in real time.
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  const ui = await mount(page, { live: false, hideDelay: HIDE_DELAY });
  await page.clock.runFor(20);
  return ui;
}

function seekBar(page: Page): Locator {
  return page.getByRole('slider', { name: 'Video timeline' });
}

// The seek preview has no role or accessible name of its own: it is a visual preview of the slider's position. Its
// visible content is the part that can be hovered.
function seekPreview(page: Page): Locator {
  return seekBar(page).locator('.bmpui-ui-seekbar-label');
}

function seekPreviewContent(page: Page): Locator {
  return seekPreview(page).locator('.bmpui-seekbar-label-inner');
}

async function boxOf(locator: Locator, name: string): Promise<{ x: number; y: number; width: number; height: number }> {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error(`the ${name} has to be laid out to be pointed at`);
  }
  return box;
}

/** Hovers the seek bar at the given fraction of its width and returns the pointer position. */
async function hoverSeekBar(page: Page, fraction: number): Promise<{ x: number; y: number }> {
  // The track inside the slider, which is what maps pointer positions to seek targets.
  const track = await boxOf(seekBar(page).locator('.bmpui-seekbar'), 'seek bar track');
  const point = { x: track.x + track.width * fraction, y: track.y + track.height / 2 };
  await page.mouse.move(point.x, point.y);
  await expect(seekPreview(page)).toBeVisible();
  return point;
}

/** Moves the pointer straight up from the seek bar onto the preview, one pixel at a time at a slow speed. */
async function moveSlowlyOntoPreview(page: Page, from: { x: number; y: number }): Promise<void> {
  const content = await boxOf(seekPreviewContent(page), 'seek preview');
  expect(from.x, 'the preview has to be above the pointer').toBeGreaterThan(content.x);
  expect(from.x, 'the preview has to be above the pointer').toBeLessThan(content.x + content.width);

  const targetY = Math.floor(content.y + content.height - 2);
  expect(targetY, 'the preview has to be above the seek bar').toBeLessThan(from.y);
  for (let y = Math.floor(from.y) - 1; y >= targetY; y--) {
    await page.clock.runFor(SLOW_POINTER_MS_PER_PX);
    await page.mouse.move(from.x, y);
  }
}

// The controls fade out through opacity, which Playwright still counts as visible, so their shown state is read from
// the UI container.
function uiContainer(page: Page): Locator {
  return page.locator('.bmpui-ui-uicontainer');
}

// A preview that is fading out still counts as visible, so also check that it was not hidden.
async function expectPreviewShown(page: Page, message: string): Promise<void> {
  await expect(seekPreview(page), message).not.toHaveClass(/bmpui-hidden/);
  await expect(seekPreview(page), message).toBeVisible();
}

for (const { name, mount } of LAYOUTS) {
  test(`${name} layout keeps the seek preview and controls visible while the pointer rests on the seek bar`, async ({
    page,
  }) => {
    await mountPlayingUi(page, mount);
    await hoverSeekBar(page, 0.5);

    await page.clock.runFor(HIDE_DELAY * 2);

    await expectPreviewShown(page, 'the preview must stay while the seek bar is hovered');
    await expect(uiContainer(page), 'the controls must not auto-hide the hovered seek bar').toHaveClass(
      /bmpui-controls-shown/,
    );
  });

  test(`${name} layout keeps the seek preview and controls visible while the pointer rests on the preview`, async ({
    page,
  }) => {
    await mountPlayingUi(page, mount);
    const start = await hoverSeekBar(page, 0.5);

    await moveSlowlyOntoPreview(page, start);
    await page.clock.runFor(HIDE_DELAY * 2);

    await expectPreviewShown(page, 'the preview must stay while it is hovered');
    await expect(uiContainer(page), 'the controls must not auto-hide the hovered preview').toHaveClass(
      /bmpui-controls-shown/,
    );

    // Leaving the preview lets both hide again.
    await page.mouse.move(start.x, 5);
    await page.clock.runFor(HIDE_DELAY * 2);

    await expect(seekPreview(page)).toBeHidden();
    await expect(uiContainer(page)).toHaveClass(/bmpui-controls-hidden/);
  });
}

test('Escape dismisses the seek preview without moving the pointer', async ({ page }) => {
  await mountPlayingUi(page, mountDefaultControlBarUi);
  const start = await hoverSeekBar(page, 0.5);
  await moveSlowlyOntoPreview(page, start);

  await page.keyboard.press('Escape');

  await expect(seekPreview(page)).toBeHidden();
});

test('scrubbing seeks to where the pointer is released, also when released over the seek preview', async ({ page }) => {
  const ui = await mountPlayingUi(page, mountDefaultControlBarUi);
  const track = await boxOf(seekBar(page).locator('.bmpui-seekbar'), 'seek bar track');
  const y = track.y + track.height / 2;
  const target = { x: track.x + track.width * 0.75, y };

  await page.mouse.move(track.x + track.width * 0.25, y);
  await page.mouse.down();
  await page.mouse.move(target.x, y, { steps: 10 });
  await expect(seekPreview(page), 'the preview follows the scrubbing pointer').toBeVisible();
  // Drag up onto the preview, which is under the pointer now that it can be hovered.
  await moveSlowlyOntoPreview(page, target);
  await page.mouse.up();

  await expect.poll(() => ui.player.currentTime()).toBeCloseTo(DURATION * 0.75, -1);
});

test('default layout seeks with the arrow keys on the focused seek bar', async ({ page }) => {
  const ui = await mountPlayingUi(page, mountDefaultControlBarUi);
  const slider = seekBar(page);
  await slider.focus();
  const initialTime = await ui.player.currentTime();

  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => ui.player.currentTime()).toBeGreaterThan(initialTime);
  const forwardTime = await ui.player.currentTime();

  await page.keyboard.press('ArrowLeft');
  await expect.poll(() => ui.player.currentTime()).toBeLessThan(forwardTime);
  await expect(slider).toBeFocused();
});

test('default layout hides the preview with Escape on the focused seek bar and keeps seeking with the arrow keys', async ({
  page,
}) => {
  const ui = await mountPlayingUi(page, mountDefaultControlBarUi);
  const slider = seekBar(page);
  await hoverSeekBar(page, 0.5);
  await slider.focus();
  const initialTime = await ui.player.currentTime();

  await page.keyboard.press('Escape');

  await expect(seekPreview(page)).toBeHidden();
  await expect(slider).toBeFocused();

  await page.keyboard.press('ArrowRight');
  await expect.poll(() => ui.player.currentTime()).toBeGreaterThan(initialTime);
});

async function focusSeekBarWithRemote(page: Page): Promise<void> {
  // Focus starts on the centered playback control, the seek bar is the next control below it.
  await page.keyboard.press('ArrowDown');
  await expect(seekBar(page), 'the remote should reach the seek bar').toBeFocused();
}

// On TV, the arrow keys scrub with the preview shown and Enter seeks to the previewed position.
async function scrubWithRemote(page: Page, key: 'ArrowLeft' | 'ArrowRight'): Promise<void> {
  // The first press starts scrubbing at the playback position, the following ones move away from it.
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press(key);
  }
  await expectPreviewShown(page, 'scrubbing with the remote should show the preview');
}

test('TV layout seeks with the remote on the focused seek bar', async ({ page }) => {
  const ui = await mountPlayingUi(page, mountTvUi);
  await focusSeekBarWithRemote(page);
  const initialTime = await ui.player.currentTime();

  await scrubWithRemote(page, 'ArrowRight');
  await page.keyboard.press('Enter');
  await expect.poll(() => ui.player.currentTime()).toBeGreaterThan(initialTime);
  const forwardTime = await ui.player.currentTime();

  await scrubWithRemote(page, 'ArrowLeft');
  await page.keyboard.press('Enter');
  await expect.poll(() => ui.player.currentTime()).toBeLessThan(forwardTime);
});

test('TV layout hides the preview with Escape on the focused seek bar and keeps seeking with the remote', async ({
  page,
}) => {
  const ui = await mountPlayingUi(page, mountTvUi);
  await focusSeekBarWithRemote(page);
  const initialTime = await ui.player.currentTime();
  await scrubWithRemote(page, 'ArrowRight');

  await page.keyboard.press('Escape');
  await page.clock.runFor(HIDE_DELAY);

  await expect(seekPreview(page)).toBeHidden();
  expect(await ui.player.currentTime(), 'cancelling the scrub must not seek').toBe(initialTime);

  await scrubWithRemote(page, 'ArrowRight');
  await page.keyboard.press('Enter');
  await expect.poll(() => ui.player.currentTime()).toBeGreaterThan(initialTime);
});
