import type { Page } from '@playwright/test';
import { expect, mountUi, test } from './harness';

async function openGraphs(page: Page): Promise<void> {
  await page.locator('.bmpui-ui-uicontainer').click({ button: 'right', position: { x: 100, y: 100 } });
  await page.getByRole('menuitem', { name: 'Show Player Graphs' }).click();
}

test('the player graphs panel opens from the context menu and fits inside the player', async ({ page }) => {
  await mountUi(page, { playerGraphs: true });

  await openGraphs(page);

  const panel = page.locator('.bmpui-ui-uicontainer .bmpui-ui-player-graphs-panel');
  await expect(panel).toBeVisible();
  const boxes = await page.evaluate(() => {
    const rect = (selector: string) => document.querySelector(selector)?.getBoundingClientRect().toJSON();
    return {
      container: rect('.bmpui-ui-uicontainer'),
      panel: rect('.bmpui-ui-player-graphs-panel'),
      canvases: ['.bmpui-ui-player-graphs-segment-timeline', '.bmpui-ui-player-graphs-download-speed'].map(rect),
    };
  });
  if (!boxes.container || !boxes.panel || boxes.canvases.some(canvas => !canvas)) {
    throw new Error(`nothing to measure: ${JSON.stringify(boxes)}`);
  }

  expect(boxes.panel.left).toBeGreaterThanOrEqual(boxes.container.left);
  expect(boxes.panel.right).toBeLessThanOrEqual(boxes.container.right);
  expect(boxes.panel.top).toBeGreaterThanOrEqual(boxes.container.top);
  expect(boxes.panel.bottom).toBeLessThanOrEqual(boxes.container.bottom);
  for (const canvas of boxes.canvases) {
    expect(canvas.width).toBeGreaterThan(0);
    expect(canvas.height).toBeGreaterThan(0);
    expect(canvas.right).toBeLessThanOrEqual(boxes.panel.right);
  }
});

test('a graph section folds and unfolds from its caption by pointer and keyboard', async ({ page }) => {
  await mountUi(page, { playerGraphs: true });
  await openGraphs(page);
  const caption = page.getByRole('button', { name: /Segment timeline/ });
  const timeline = page.locator('.bmpui-ui-player-graphs-segment-timeline');
  await expect(timeline).toBeVisible();

  await caption.click();

  await expect(timeline).toBeHidden();

  await caption.focus();
  await page.keyboard.press('Enter');

  await expect(timeline).toBeVisible();
});

test('the graphs are not offered without UIConfig.playerGraphs', async ({ page }) => {
  await mountUi(page);

  await page.locator('.bmpui-ui-uicontainer').click({ button: 'right', position: { x: 100, y: 100 } });

  await expect(page.getByRole('menuitem', { name: 'Show Player Insights' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Show Player Graphs' })).toHaveCount(0);
});
