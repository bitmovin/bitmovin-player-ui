import { expect, mountUi, test } from './harness';

for (const factory of ['default', 'smallScreen', 'tv'] as const) {
  for (const hostReset of [false, true]) {
    test(`pause-ad pills have equal heights in ${factory}, host reset: ${hostReset}`, async ({ page }) => {
      const ui = await mountUi(page, { factory, hostReset, mobile: factory === 'smallScreen', live: false });
      await ui.player.startPauseAd();
      const badge = page.locator('.bmpui-ui-pause-ad-status-badge');
      const close = page.getByRole('button', { name: 'Close', exact: true });
      await expect(badge).toBeVisible();
      await expect(close).toBeVisible();

      const badgeBounds = await badge.boundingBox();
      const closeBounds = await close.boundingBox();
      if (!badgeBounds || !closeBounds) throw new Error('both pause-ad pills must be laid out');

      expect(badgeBounds.height).toBeGreaterThan(0);
      expect(badgeBounds.height).toBeCloseTo(closeBounds.height, 2);
      expect(badgeBounds.y).toBeCloseTo(closeBounds.y, 2);
    });
  }
}
