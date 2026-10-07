import type { LinearAd } from 'bitmovin-player';
import { expect, mountUi, test } from './harness';

function ad(id: string, duration: number): LinearAd {
  return {
    id,
    isLinear: true,
    width: 640,
    height: 360,
    duration,
    skippableAfter: 10,
    uiConfig: {
      requestsUi: true,
      message: 'Message {activeAdIndex}/{totalAdsCount}; break {adBreakRemainingTime}; ad {remainingTime}/{adDuration}',
    },
  };
}

test('filtered counter groups scheduled breaks while the countdown uses the current break', async ({ page }) => {
  const ui = await mountUi(page, { live: false, excludedAdIds: ['excluded-before', 'excluded-after'] });

  await ui.player.startAd({
    adBreak: {
      id: 'current',
      scheduleTime: 0,
      ads: [ad('excluded-before', 10), ad('active', 20), ad('excluded-after', 100), ad('later', 30)],
    },
    adId: 'active',
    scheduledBreaks: [{ id: 'next', scheduleTime: 0, ads: [ad('next', 90)] }],
  });
  await ui.player.setCurrentTime(4);

  await expect(page.getByText('Ad 1 of 3', { exact: true })).toBeVisible();
  await expect(page.getByText('Message 2/4; break 46; ad 16/20', { exact: true })).toBeVisible();
});

test('an excluded active ad keeps its message without reducing counted duration', async ({ page }) => {
  const ui = await mountUi(page, { live: false, excludedAdIds: ['excluded'] });

  await ui.player.startAd({
    adBreak: {
      id: 'current',
      scheduleTime: 0,
      ads: [ad('excluded', 20), ad('later', 30)],
    },
    adId: 'excluded',
    scheduledBreaks: [{ id: 'next', scheduleTime: 0, ads: [ad('next', 90)] }],
  });

  // Both the counter's normal ad message and the ordinary message label stay visible.
  const messages = page.getByText('Message 1/2; break 30; ad 20/20', { exact: true });
  await expect(messages).toHaveCount(2);
  await expect(messages.nth(0)).toBeVisible();
  await expect(messages.nth(1)).toBeVisible();

  await ui.player.setCurrentTime(4);

  await expect(page.getByText('Message 1/2; break 30; ad 16/20', { exact: true })).toHaveCount(2);
});
