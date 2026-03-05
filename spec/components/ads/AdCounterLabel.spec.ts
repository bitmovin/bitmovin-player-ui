import { MockHelper, TestingPlayerAPI } from '../../helper/MockHelper';
import { UIInstanceManager } from '../../../src/ts/UIManager';
import { AdCounterLabel } from '../../../src/ts/components/ads/AdCounterLabel';
import { AdBreak } from 'bitmovin-player';

let playerMock: TestingPlayerAPI;
let uiInstanceManagerMock: UIInstanceManager;
let adCounterLabel: AdCounterLabel;

const makeBreak = (id: string, scheduleTime: number, ads: { id: string }[]) =>
  ({ id, scheduleTime, ads }) as unknown as AdBreak;

// Mutable ad state that the player mock delegates to.
// `list` represents the breaks still upcoming (active and past breaks are excluded).
let adsState: {
  activeAdBreak: ReturnType<typeof makeBreak> | null;
  activeAd: { id: string } | null;
  list: ReturnType<typeof makeBreak>[];
};

describe('AdCounterLabel', () => {
  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();

    adsState = { activeAdBreak: null, activeAd: null, list: [] };

    Object.defineProperty(playerMock, 'ads', {
      get: () => ({
        getActiveAdBreak: () => adsState.activeAdBreak,
        getActiveAd: () => adsState.activeAd,
        list: () => adsState.list,
        isLinearAdActive: () => adsState.activeAd !== null,
      }),
      configurable: true,
    });

    adCounterLabel = new AdCounterLabel({ adCountOutOfTotal: 'Ad {activeAdIndex} of {totalAdsCount}' });
    adCounterLabel.configure(playerMock, uiInstanceManagerMock);
  });

  describe('single ad break', () => {
    it('shows correct index and total for a single ad in a break', () => {
      const ad = { id: 'a1' };
      const adBreak = makeBreak('break-1', 5, [ad]);

      adsState.activeAdBreak = adBreak;
      adsState.list = [];
      playerMock.eventEmitter.fireAdBreakStartedEvent(5, [ad as any]);

      adsState.activeAd = ad;
      playerMock.eventEmitter.fireAdStartedEvent();

      expect(adCounterLabel.getText()).toBe('Ad 1 of 1');
    });

    it('shows correct index and total for multiple ads in a single break', () => {
      const ads = [{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }];
      const adBreak = makeBreak('break-1', 5, ads);

      adsState.activeAdBreak = adBreak;
      adsState.list = [];
      playerMock.eventEmitter.fireAdBreakStartedEvent(5, ads as any);

      adsState.activeAd = ads[1];
      playerMock.eventEmitter.fireAdStartedEvent();

      expect(adCounterLabel.getText()).toBe('Ad 2 of 3');
    });

    it('clears text on AdBreakFinished', () => {
      const ad = { id: 'a1' };
      const adBreak = makeBreak('break-1', 5, [ad]);

      adsState.activeAdBreak = adBreak;
      adsState.list = [];
      playerMock.eventEmitter.fireAdBreakStartedEvent(5, [ad as any]);

      adsState.activeAd = ad;
      playerMock.eventEmitter.fireAdStartedEvent();

      adsState.activeAd = null;
      adsState.activeAdBreak = null;
      playerMock.eventEmitter.fireAdBreakFinishedEvent(adBreak);

      expect(adCounterLabel.getText()).toBe('');
    });
  });

  describe('co-scheduled ad breaks (same scheduleTime)', () => {
    it('shows Ad 1 of 3 for the first of three co-scheduled single-ad breaks', () => {
      const ad1 = { id: 'a1' };
      const ad2 = { id: 'a2' };
      const ad3 = { id: 'a3' };
      const break1 = makeBreak('break-1', 5, [ad1]);
      const break2 = makeBreak('break-2', 5, [ad2]);
      const break3 = makeBreak('break-3', 5, [ad3]);

      // break-1 is active; break-2 and break-3 are still in list()
      adsState.activeAdBreak = break1;
      adsState.list = [break2, break3];
      playerMock.eventEmitter.fireAdBreakStartedEvent(5, [ad1 as any]);

      adsState.activeAd = ad1;
      playerMock.eventEmitter.fireAdStartedEvent();

      expect(adCounterLabel.getText()).toBe('Ad 1 of 3');
    });

    it('shows Ad 2 of 3 for the second co-scheduled break after the first finishes', () => {
      const ad1 = { id: 'a1' };
      const ad2 = { id: 'a2' };
      const ad3 = { id: 'a3' };
      const break1 = makeBreak('break-1', 5, [ad1]);
      const break2 = makeBreak('break-2', 5, [ad2]);
      const break3 = makeBreak('break-3', 5, [ad3]);

      // Break 1
      adsState.activeAdBreak = break1;
      adsState.list = [break2, break3];
      playerMock.eventEmitter.fireAdBreakStartedEvent(5, [ad1 as any]);
      adsState.activeAd = ad1;
      playerMock.eventEmitter.fireAdStartedEvent();
      adsState.activeAd = null;
      adsState.activeAdBreak = null;
      playerMock.eventEmitter.fireAdBreakFinishedEvent(break1);

      // Break 2 — break-3 is still in list()
      adsState.activeAdBreak = break2;
      adsState.list = [break3];
      playerMock.eventEmitter.fireAdBreakStartedEvent(5, [ad2 as any]);
      adsState.activeAd = ad2;
      playerMock.eventEmitter.fireAdStartedEvent();

      expect(adCounterLabel.getText()).toBe('Ad 2 of 3');
    });

    it('shows Ad 3 of 3 for the third co-scheduled break', () => {
      const ad1 = { id: 'a1' };
      const ad2 = { id: 'a2' };
      const ad3 = { id: 'a3' };
      const break1 = makeBreak('break-1', 5, [ad1]);
      const break2 = makeBreak('break-2', 5, [ad2]);
      const break3 = makeBreak('break-3', 5, [ad3]);

      // Break 1
      adsState.activeAdBreak = break1;
      adsState.list = [break2, break3];
      playerMock.eventEmitter.fireAdBreakStartedEvent(5, [ad1 as any]);
      adsState.activeAd = ad1;
      playerMock.eventEmitter.fireAdStartedEvent();
      adsState.activeAd = null;
      adsState.activeAdBreak = null;
      playerMock.eventEmitter.fireAdBreakFinishedEvent(break1);

      // Break 2
      adsState.activeAdBreak = break2;
      adsState.list = [break3];
      playerMock.eventEmitter.fireAdBreakStartedEvent(5, [ad2 as any]);
      adsState.activeAd = ad2;
      playerMock.eventEmitter.fireAdStartedEvent();
      adsState.activeAd = null;
      adsState.activeAdBreak = null;
      playerMock.eventEmitter.fireAdBreakFinishedEvent(break2);

      // Break 3 — no siblings left in list()
      adsState.activeAdBreak = break3;
      adsState.list = [];
      playerMock.eventEmitter.fireAdBreakStartedEvent(5, [ad3 as any]);
      adsState.activeAd = ad3;
      playerMock.eventEmitter.fireAdStartedEvent();

      expect(adCounterLabel.getText()).toBe('Ad 3 of 3');
    });

    it('resets state after the last co-scheduled break finishes', () => {
      const ad1 = { id: 'a1' };
      const ad2 = { id: 'a2' };
      const break1 = makeBreak('break-1', 5, [ad1]);
      const break2 = makeBreak('break-2', 5, [ad2]);

      // Break 1
      adsState.activeAdBreak = break1;
      adsState.list = [break2];
      playerMock.eventEmitter.fireAdBreakStartedEvent(5, [ad1 as any]);
      adsState.activeAd = ad1;
      playerMock.eventEmitter.fireAdStartedEvent();
      adsState.activeAd = null;
      adsState.activeAdBreak = null;
      playerMock.eventEmitter.fireAdBreakFinishedEvent(break1);

      // Break 2 — last in group
      adsState.activeAdBreak = break2;
      adsState.list = [];
      playerMock.eventEmitter.fireAdBreakStartedEvent(5, [ad2 as any]);
      adsState.activeAd = ad2;
      playerMock.eventEmitter.fireAdStartedEvent();
      adsState.activeAd = null;
      adsState.activeAdBreak = null;
      playerMock.eventEmitter.fireAdBreakFinishedEvent(break2);

      // Subsequent unrelated break at a different time should show 1 of 1
      const adNext = { id: 'a-next' };
      const breakNext = makeBreak('break-next', 10, [adNext]);
      adsState.activeAdBreak = breakNext;
      adsState.list = [];
      playerMock.eventEmitter.fireAdBreakStartedEvent(10, [adNext as any]);
      adsState.activeAd = adNext;
      playerMock.eventEmitter.fireAdStartedEvent();

      expect(adCounterLabel.getText()).toBe('Ad 1 of 1');
    });

    it('handles co-scheduled breaks where each break contains multiple ads', () => {
      const ads1 = [{ id: 'a1' }, { id: 'a2' }];
      const ads2 = [{ id: 'a3' }, { id: 'a4' }];
      const break1 = makeBreak('break-1', 5, ads1);
      const break2 = makeBreak('break-2', 5, ads2);

      // Break 1, second ad playing. Sibling break-2 is in list() with its ads already populated,
      // so total = 2 (current break) + 2 (sibling break) = 4.
      adsState.activeAdBreak = break1;
      adsState.list = [break2];
      playerMock.eventEmitter.fireAdBreakStartedEvent(5, ads1 as any);
      adsState.activeAd = ads1[1];
      playerMock.eventEmitter.fireAdStartedEvent();

      expect(adCounterLabel.getText()).toBe('Ad 2 of 4');

      // Break 1 finishes
      adsState.activeAd = null;
      adsState.activeAdBreak = null;
      playerMock.eventEmitter.fireAdBreakFinishedEvent(break1);

      // Break 2 starts — now its real ad count (2) is known via getActiveAdBreak(), so total updates to 2 + 2 = 4.
      adsState.activeAdBreak = break2;
      adsState.list = [];
      playerMock.eventEmitter.fireAdBreakStartedEvent(5, ads2 as any);
      adsState.activeAd = ads2[0];
      playerMock.eventEmitter.fireAdStartedEvent();

      expect(adCounterLabel.getText()).toBe('Ad 3 of 4');
    });
  });
});
