import type { Locator } from '@playwright/test';
import { expect, test, mountUi } from './harness';
import { mountDefaultControlBarUi } from './helpers/control-bar';

/** Check the rendered circle on the same element that carries the accessible name. */
async function indicatorShape(liveButton: Locator): Promise<string> {
  return liveButton.evaluate(element => {
    const indicator = getComputedStyle(element, '::before');
    if (indicator.display === 'none' || indicator.visibility === 'hidden') return 'hidden';
    if (
      parseFloat(indicator.width) <= 0 ||
      indicator.width !== indicator.height ||
      parseFloat(indicator.borderTopWidth) <= 0 ||
      indicator.borderRadius !== '50%' ||
      indicator.content !== '""'
    )
      return 'not a circle';
    return indicator.backgroundColor === 'rgba(0, 0, 0, 0)'
      ? 'ring'
      : indicator.backgroundColor === indicator.borderTopColor
        ? 'dot'
        : 'not filled';
  });
}

test('tells at the live edge and behind live apart by accessible name and indicator shape', async ({ page }) => {
  const ui = await mountDefaultControlBarUi(page, { live: true });
  const controls = page.getByRole('region', { name: 'Video player controls' });
  const atLiveEdge = controls.getByRole('button', { name: 'Live, at live edge', exact: true });
  const behindLive = controls.getByRole('button', { name: 'Live, delayed, jump to live edge', exact: true });
  await expect(atLiveEdge).toBeVisible();
  await expect.poll(() => indicatorShape(atLiveEdge)).toBe('dot');

  await ui.player.timeShift(-30);

  await expect(behindLive).toBeVisible();
  await expect.poll(() => indicatorShape(behindLive)).toBe('ring');

  await behindLive.click();

  await expect(atLiveEdge).toBeVisible();
  await expect.poll(() => indicatorShape(atLiveEdge)).toBe('dot');
});

async function labelGeometry(liveButton: Locator) {
  return liveButton.evaluate(element => {
    const text = element.querySelector('.bmpui-ui-label-text');
    if (!text) throw new Error('the LIVE label text is missing');
    const range = document.createRange();
    range.selectNodeContents(text);
    const textBox = range.getBoundingClientRect();
    const labelBox = element.getBoundingClientRect();
    return { x: labelBox.x, width: labelBox.width, textX: textBox.x, textY: textBox.y };
  });
}

test('should preserve a custom skin indicator in both live states', async ({ page }) => {
  const ui = await mountUi(page, { live: true });
  await page.addStyleTag({
    content:
      '.bmpui-ui-playbacktimelabel.bmpui-ui-playbacktimelabel-live::before { content: "◆"; background: none; border: 0; width: auto; height: auto; }',
  });
  const liveButton = page.getByRole('button', { name: 'Live, at live edge', exact: true });
  const content = (button: Locator) => button.evaluate(element => getComputedStyle(element, '::before').content);
  await expect(liveButton).toBeVisible();
  await expect.poll(() => content(liveButton)).toBe('"◆"');

  await ui.player.timeShift(-30);
  const behindLive = page.getByRole('button', { name: 'Live, delayed, jump to live edge', exact: true });
  await expect(behindLive).toBeVisible();
  await expect.poll(() => content(behindLive)).toBe('"◆"');

  await behindLive.click();
  await expect.poll(() => content(liveButton)).toBe('"◆"');
});

for (const factory of ['default', 'smallScreen', 'tv'] as const) {
  for (const hostReset of [false, true]) {
    test.describe(`${factory}, host reset ${hostReset}`, () => {
      test('should keep the LIVE text and button stationary when the live state changes', async ({ page }) => {
        const ui = await mountUi(page, { live: true, factory, hostReset });
        const liveButton = page.getByRole('button', { name: 'Live, at live edge', exact: true });
        await expect(liveButton).toBeVisible();

        for (const font of ['', 'serif', 'monospace']) {
          await liveButton.evaluate((element, family) => {
            element.style.fontFamily = family;
          }, font);
          await ui.player.tick();
          const atEdge = await labelGeometry(liveButton);

          await ui.player.timeShift(-30);
          const behindLive = page.getByRole('button', { name: 'Live, delayed, jump to live edge', exact: true });
          await expect(behindLive).toBeVisible();
          expect(await labelGeometry(behindLive)).toEqual(atEdge);

          await behindLive.click();
          await expect(liveButton).toBeVisible();
          expect(await labelGeometry(liveButton)).toEqual(atEdge);
        }
      });

      test('should fit a longer live translation immediately and shrink back on a language change', async ({
        page,
      }) => {
        const ui = await mountUi(page, { live: true, factory, hostReset });
        const liveButton = page.getByRole('button', { name: 'Live, at live edge', exact: true });
        await expect(liveButton).toBeVisible();
        await ui.player.tick();
        const english = await labelGeometry(liveButton);

        await ui.setLanguage('es');
        const translated = page.getByRole('button', { name: 'Directo, sin retraso', exact: true });
        await expect(translated).toHaveText('Directo');
        const spanish = await labelGeometry(translated);
        expect(spanish.width).toBeGreaterThan(english.width);
        const bounds = await translated.evaluate(element => {
          const text = element.querySelector('.bmpui-ui-label-text');
          if (!text) throw new Error('the LIVE label text is missing');
          const range = document.createRange();
          range.selectNodeContents(text);
          return { textRight: range.getBoundingClientRect().right, labelRight: element.getBoundingClientRect().right };
        });
        expect(bounds.textRight).toBeLessThanOrEqual(bounds.labelRight);

        await ui.setLanguage('en');
        await expect(liveButton).toBeVisible();
        expect(await labelGeometry(liveButton)).toEqual(english);
      });
    });
  }
}
