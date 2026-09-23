import path from 'path';
import { pathToFileURL } from 'url';
import { Page } from '@playwright/test';
import { expect, test } from './harness';

const demoUrl =
  process.env.PAUSE_AD_DEMO_URL || pathToFileURL(path.resolve(__dirname, '../../dist/pause-ad-demo.html')).href;
const localPlayer = path.resolve(__dirname, '../../node_modules/bitmovin-player/bitmovinplayer.js');

test.use({ hasTouch: true });

async function openDemo(page: Page, layout: 'desktop' | 'mobile' | 'tv' = 'desktop'): Promise<void> {
  await page.route('https://cdn.jsdelivr.net/npm/bitmovin-player@8.18.2/bitmovinplayer.js', route =>
    route.fulfill({ path: localPlayer }),
  );
  const url = new URL(demoUrl);
  url.searchParams.set('layout', layout);
  await page.goto(url.href);
}

test('source metadata gives way to pause-ad controls and returns afterward', async ({ page }) => {
  await openDemo(page);
  const title = page.locator('.bmpui-label-metadata-title');
  const description = page.locator('.bmpui-label-metadata-description');
  await expect(title).toBeVisible();
  await expect(description).toBeVisible();

  await page.getByRole('button', { name: 'Start ad without link' }).click();
  await expect(page.locator('.bmpui-ui-pause-ad-status-badge')).toBeVisible();
  await expect(page.locator('.bmpui-ui-button-pause-ad-dismiss')).toBeVisible();
  await expect(title).toBeHidden();
  await expect(description).toBeHidden();

  await page.getByRole('button', { name: 'Finish ad' }).click();
  await expect(title).toBeVisible();
  await expect(description).toBeVisible();
});

test('clicking the creative opens the demo destination', async ({ page }) => {
  await openDemo(page);

  await page.getByRole('button', { name: 'Start clickable ad' }).click();
  await expect(page.locator('.bmpui-ui-pause-ad-status-overlay')).toBeVisible();
  await page.locator('.bmpui-ui-pause-ad-click-catcher').click();
  await expect(page).toHaveURL(/pause-ad-clickthrough\.html/);
  await expect(page.getByRole('heading', { name: 'Clickthrough opened' })).toBeVisible();
});

test('mobile layout gives the pause ad a portrait player view', async ({ page }) => {
  await openDemo(page, 'mobile');
  const bounds = await page.locator('#player').boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.height).toBeGreaterThan(bounds!.width);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height);

  await page.getByRole('button', { name: 'Start clickable ad' }).click();
  await expect(page.locator('.bmpui-ui-pause-ad-status-overlay')).toBeVisible();
});
