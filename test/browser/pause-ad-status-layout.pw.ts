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

for (const factory of ['default', 'smallScreen', 'tv'] as const) {
  test(`the Learn more pill sits beside Close with an equal height in ${factory}`, async ({ page }) => {
    const ui = await mountUi(page, { factory, mobile: factory === 'smallScreen', live: false });
    await ui.player.startPauseAd({ clickThroughUrl: 'https://example.com/pause-ad' });
    const learnMore = page.getByRole('button', { name: 'Learn more, opens in a new tab', exact: true });
    const close = page.getByRole('button', { name: 'Close', exact: true });
    await expect(learnMore).toBeVisible();
    await expect(close).toBeVisible();

    const learnMoreBounds = await learnMore.boundingBox();
    const closeBounds = await close.boundingBox();
    if (!learnMoreBounds || !closeBounds) throw new Error('both pause-ad buttons must be laid out');

    expect(learnMoreBounds.height).toBeCloseTo(closeBounds.height, 2);
    expect(learnMoreBounds.y).toBeCloseTo(closeBounds.y, 2);
    expect(learnMoreBounds.x + learnMoreBounds.width, 'the pills must not overlap').toBeLessThan(closeBounds.x);
  });
}

for (const factory of ['default', 'smallScreen', 'tv'] as const) {
  test(`the pause-ad status row fits a narrow player with long translations in ${factory}`, async ({ page }) => {
    const ui = await mountUi(page, {
      factory,
      mobile: factory === 'smallScreen',
      live: false,
      vocabularies: {
        en: {
          ad: 'Sponsored advertisement',
          'ads.learnMore': 'Discover more about this offer',
          'ads.learnMore.newTab': 'Discover more about this offer, opens in a new tab',
          close: 'Close the advertisement',
        },
      },
    });
    await ui.player.resize(360);
    await ui.player.startPauseAd({ clickThroughUrl: 'https://example.com/pause-ad' });

    const overlay = page.locator('.bmpui-ui-pause-ad-status-overlay:visible');
    const badge = overlay.locator('.bmpui-ui-pause-ad-status-badge');
    const learnMore = overlay.getByRole('button', { name: 'Discover more about this offer, opens in a new tab' });
    const close = overlay.getByRole('button', { name: 'Close the advertisement' });
    await expect(badge).toBeVisible();
    await expect(learnMore).toBeVisible();
    await expect(close).toBeVisible();

    const overlayBounds = await overlay.boundingBox();
    const pills = await Promise.all([badge, learnMore, close].map(pill => pill.boundingBox()));
    if (!overlayBounds || pills.some(bounds => !bounds)) throw new Error('the pause-ad status row must be laid out');

    pills.forEach((bounds, index) => {
      expect(bounds!.x, `pill ${index} must start inside the player`).toBeGreaterThanOrEqual(overlayBounds.x);
      expect(bounds!.x + bounds!.width, `pill ${index} must end inside the player`).toBeLessThanOrEqual(
        overlayBounds.x + overlayBounds.width,
      );
    });
    for (let first = 0; first < pills.length; first++) {
      for (let second = first + 1; second < pills.length; second++) {
        const a = pills[first]!;
        const b = pills[second]!;
        const overlapping = a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
        expect(overlapping, `pills ${first} and ${second} must not overlap`).toBe(false);
      }
    }
  });
}

test('the Learn more accessible name follows a UI language change together with its text', async ({ page }) => {
  const ui = await mountUi(page, { live: false });
  await ui.player.startPauseAd({ clickThroughUrl: 'https://example.com/pause-ad' });

  await ui.setLanguage('de');

  const learnMore = page.getByRole('button', { name: 'Mehr erfahren, öffnet in einem neuen Tab', exact: true });
  await expect(learnMore, 'the accessible name must be in the new language').toBeVisible();
  await expect(learnMore, 'the accessible name must contain the visible text').toHaveText('Mehr erfahren');
});
