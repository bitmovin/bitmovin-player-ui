import { AdBreak, PlayerEvent } from 'bitmovin-player';
import { PlayerEventEmitter } from '../helper/PlayerEventEmitter';
import { AdBreakTracker } from '../../src/ts/utils/AdBreakTracker';

const makeBreak = (id: string, scheduleTime: number, ads: { id: string }[] = []): AdBreak =>
  ({ id, scheduleTime, ads }) as unknown as AdBreak;

// Mutable ad state the player mock delegates to.
// `list` represents upcoming breaks (the active break is excluded).
let adsState: {
  activeAdBreak: ReturnType<typeof makeBreak> | null;
  activeAd: { id: string } | null;
  list: ReturnType<typeof makeBreak>[];
};

let eventEmitter: PlayerEventEmitter;
let player: any;
let tracker: AdBreakTracker;

describe('AdBreakTracker', () => {
  beforeEach(() => {
    adsState = { activeAdBreak: null, activeAd: null, list: [] };
    eventEmitter = new PlayerEventEmitter();

    player = {
      exports: { PlayerEvent },
      on: eventEmitter.on.bind(eventEmitter),
      off: jest.fn(),
      ads: {
        getActiveAdBreak: () => adsState.activeAdBreak,
        getActiveAd: () => adsState.activeAd,
        list: () => adsState.list,
      },
    };

    tracker = new AdBreakTracker(player);
  });

  afterEach(() => {
    tracker.release();
  });

  describe('single ad break (no siblings)', () => {
    it('returns currentAdIndex=1 and totalNumberOfAds=1 for a single-ad break', () => {
      const ad = { id: 'a1' };
      const adBreak = makeBreak('break-1', 5, [ad]);
      adsState.activeAdBreak = adBreak;
      adsState.activeAd = ad;
      adsState.list = [];
      eventEmitter.fireAdStartedEvent();

      expect(tracker.currentAdIndex).toBe(1);
      expect(tracker.totalNumberOfAds).toBe(1);
    });

    it('returns correct index for a later ad within the same break', () => {
      const ads = [{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }];
      const adBreak = makeBreak('break-1', 5, ads);
      adsState.activeAdBreak = adBreak;
      adsState.activeAd = ads[1];
      adsState.list = [];
      eventEmitter.fireAdStartedEvent();

      expect(tracker.currentAdIndex).toBe(2);
      expect(tracker.totalNumberOfAds).toBe(3);
    });

    it('does not change currentAdIndex or totalNumberOfAds when a lone break finishes', () => {
      const ad = { id: 'a1' };
      const adBreak = makeBreak('break-1', 5, [ad]);
      adsState.activeAdBreak = adBreak;
      adsState.activeAd = ad;
      adsState.list = [];
      eventEmitter.fireAdStartedEvent();

      adsState.activeAd = null;
      adsState.activeAdBreak = null;
      eventEmitter.fireAdBreakFinishedEvent(adBreak);

      // groupScheduleTime is undefined for a lone break, so AdBreakFinished is a no-op
      expect(tracker.currentAdIndex).toBe(1);
      expect(tracker.totalNumberOfAds).toBe(1);
    });
  });

  describe('co-scheduled ad breaks (same scheduleTime)', () => {
    it('shows currentAdIndex=1 and totalNumberOfAds=3 for the first of three co-scheduled single-ad breaks', () => {
      const break1 = makeBreak('break-1', 5, [{ id: 'a1' }]);
      const break2 = makeBreak('break-2', 5, [{ id: 'a2' }]);
      const break3 = makeBreak('break-3', 5, [{ id: 'a3' }]);

      adsState.activeAdBreak = break1;
      adsState.activeAd = { id: 'a1' };
      adsState.list = [break2, break3];
      eventEmitter.fireAdStartedEvent();

      expect(tracker.currentAdIndex).toBe(1);
      expect(tracker.totalNumberOfAds).toBe(3); // 1 current + 2 siblings
    });

    it('carries offset after the first break finishes', () => {
      const break1 = makeBreak('break-1', 5, [{ id: 'a1' }]);
      const break2 = makeBreak('break-2', 5, [{ id: 'a2' }]);

      adsState.activeAdBreak = break1;
      adsState.activeAd = { id: 'a1' };
      adsState.list = [break2];
      eventEmitter.fireAdStartedEvent();

      adsState.activeAd = null;
      adsState.activeAdBreak = null;
      eventEmitter.fireAdBreakFinishedEvent(break1);

      // Between breaks: currentAdIndex is unchanged (still 1), totalNumberOfAds carries last known value
      expect(tracker.currentAdIndex).toBe(1);
      expect(tracker.totalNumberOfAds).toBe(2);
    });

    it('shows currentAdIndex=2 and corrected total when the second break starts with its real ad count', () => {
      const break1 = makeBreak('break-1', 5, [{ id: 'a1' }]);
      const break2 = makeBreak('break-2', 5, [{ id: 'a2' }, { id: 'a3' }]);

      adsState.activeAdBreak = break1;
      adsState.activeAd = { id: 'a1' };
      adsState.list = [break2];
      eventEmitter.fireAdStartedEvent();

      adsState.activeAd = null;
      adsState.activeAdBreak = null;
      eventEmitter.fireAdBreakFinishedEvent(break1);

      // break-2 starts — now its real ad count (2) is known via getActiveAdBreak()
      adsState.activeAdBreak = break2;
      adsState.activeAd = { id: 'a2' };
      adsState.list = [];
      eventEmitter.fireAdStartedEvent();

      expect(tracker.currentAdIndex).toBe(2); // 1 offset + position 1 in break2
      expect(tracker.totalNumberOfAds).toBe(3); // 1 offset + 2 from break-2
    });

    it('retains last state after the last sibling break finishes (no full reset until next AdStarted)', () => {
      const break1 = makeBreak('break-1', 5, [{ id: 'a1' }]);
      const break2 = makeBreak('break-2', 5, [{ id: 'a2' }]);

      adsState.activeAdBreak = break1;
      adsState.activeAd = { id: 'a1' };
      adsState.list = [break2];
      eventEmitter.fireAdStartedEvent();

      adsState.activeAd = null;
      adsState.activeAdBreak = null;
      eventEmitter.fireAdBreakFinishedEvent(break1);

      adsState.activeAdBreak = break2;
      adsState.activeAd = { id: 'a2' };
      adsState.list = [];
      eventEmitter.fireAdStartedEvent();

      adsState.activeAd = null;
      adsState.activeAdBreak = null;
      eventEmitter.fireAdBreakFinishedEvent(break2);

      // AdBreakFinished accumulates offset; currentAdIndex holds its last value until the next AdStarted
      expect(tracker.currentAdIndex).toBe(2);
      expect(tracker.totalNumberOfAds).toBe(2);
    });

    it('does not reset between breaks while siblings remain', () => {
      const break1 = makeBreak('break-1', 5, [{ id: 'a1' }]);
      const break2 = makeBreak('break-2', 5, [{ id: 'a2' }]);
      const break3 = makeBreak('break-3', 5, [{ id: 'a3' }]);

      adsState.activeAdBreak = break1;
      adsState.activeAd = { id: 'a1' };
      adsState.list = [break2, break3];
      eventEmitter.fireAdStartedEvent();

      adsState.activeAd = null;
      adsState.activeAdBreak = null;
      eventEmitter.fireAdBreakFinishedEvent(break1);

      // currentAdIndex unchanged between breaks; totalNumberOfAds carries group total
      expect(tracker.currentAdIndex).toBe(1);
      expect(tracker.totalNumberOfAds).toBe(3);
    });

    it('ignores AdBreakFinished for a different scheduleTime', () => {
      const break1 = makeBreak('break-1', 5, [{ id: 'a1' }]);
      const break2 = makeBreak('break-2', 5, [{ id: 'a2' }]);
      const unrelated = makeBreak('break-x', 10, [{ id: 'ax' }]);

      adsState.activeAdBreak = break1;
      adsState.activeAd = { id: 'a1' };
      adsState.list = [break2];
      eventEmitter.fireAdStartedEvent();

      eventEmitter.fireAdBreakFinishedEvent(unrelated); // should be a no-op

      expect(tracker.currentAdIndex).toBe(1);
      expect(tracker.totalNumberOfAds).toBe(2);
    });

    it('handles three single-ad breaks producing correct indices throughout', () => {
      const break1 = makeBreak('break-1', 5, [{ id: 'a1' }]);
      const break2 = makeBreak('break-2', 5, [{ id: 'a2' }]);
      const break3 = makeBreak('break-3', 5, [{ id: 'a3' }]);

      adsState.activeAdBreak = break1;
      adsState.activeAd = { id: 'a1' };
      adsState.list = [break2, break3];
      eventEmitter.fireAdStartedEvent();
      expect(tracker.currentAdIndex).toBe(1);
      expect(tracker.totalNumberOfAds).toBe(3);

      adsState.activeAd = null;
      adsState.activeAdBreak = null;
      eventEmitter.fireAdBreakFinishedEvent(break1);
      adsState.activeAdBreak = break2;
      adsState.activeAd = { id: 'a2' };
      adsState.list = [break3];
      eventEmitter.fireAdStartedEvent();
      expect(tracker.currentAdIndex).toBe(2);
      expect(tracker.totalNumberOfAds).toBe(3);

      adsState.activeAd = null;
      adsState.activeAdBreak = null;
      eventEmitter.fireAdBreakFinishedEvent(break2);
      adsState.activeAdBreak = break3;
      adsState.activeAd = { id: 'a3' };
      adsState.list = [];
      eventEmitter.fireAdStartedEvent();
      expect(tracker.currentAdIndex).toBe(3);
      expect(tracker.totalNumberOfAds).toBe(3);

      adsState.activeAd = null;
      adsState.activeAdBreak = null;
      eventEmitter.fireAdBreakFinishedEvent(break3);
      // After all breaks done, currentAdIndex holds last value until next AdStarted
      expect(tracker.currentAdIndex).toBe(3);
      expect(tracker.totalNumberOfAds).toBe(3);
    });

    it('resets correctly so a subsequent unrelated break shows 1 of 1', () => {
      const break1 = makeBreak('break-1', 5, [{ id: 'a1' }]);
      const break2 = makeBreak('break-2', 5, [{ id: 'a2' }]);

      adsState.activeAdBreak = break1;
      adsState.activeAd = { id: 'a1' };
      adsState.list = [break2];
      eventEmitter.fireAdStartedEvent();
      adsState.activeAd = null;
      adsState.activeAdBreak = null;
      eventEmitter.fireAdBreakFinishedEvent(break1);

      adsState.activeAdBreak = break2;
      adsState.activeAd = { id: 'a2' };
      adsState.list = [];
      eventEmitter.fireAdStartedEvent();
      adsState.activeAd = null;
      adsState.activeAdBreak = null;
      eventEmitter.fireAdBreakFinishedEvent(break2);

      const breakNext = makeBreak('break-next', 10, [{ id: 'ax' }]);
      adsState.activeAdBreak = breakNext;
      adsState.activeAd = { id: 'ax' };
      adsState.list = [];
      eventEmitter.fireAdStartedEvent();

      expect(tracker.currentAdIndex).toBe(1);
      expect(tracker.totalNumberOfAds).toBe(1);
    });

    it('dispatches onChanged with currentAdIndex and totalNumberOfAds after AdStarted', () => {
      const break1 = makeBreak('break-1', 5, [{ id: 'a1' }]);
      const break2 = makeBreak('break-2', 5, [{ id: 'a2' }]);
      const onChange = jest.fn();
      tracker.onChanged.subscribe(onChange);

      adsState.activeAdBreak = break1;
      adsState.activeAd = { id: 'a1' };
      adsState.list = [break2];
      eventEmitter.fireAdStartedEvent();

      expect(onChange).toHaveBeenCalledWith(tracker, { currentAdIndex: 1, totalNumberOfAds: 2 });
    });

    it('dispatches onChanged with currentAdIndex and totalNumberOfAds after AdBreakFinished', () => {
      const break1 = makeBreak('break-1', 5, [{ id: 'a1' }]);
      const break2 = makeBreak('break-2', 5, [{ id: 'a2' }]);
      const onChange = jest.fn();

      adsState.activeAdBreak = break1;
      adsState.activeAd = { id: 'a1' };
      adsState.list = [break2];
      eventEmitter.fireAdStartedEvent();

      tracker.onChanged.subscribe(onChange);
      adsState.activeAd = null;
      adsState.activeAdBreak = null;
      eventEmitter.fireAdBreakFinishedEvent(break1);

      // currentAdIndex retains the last playing ad's index between breaks; only the offset has changed
      expect(onChange).toHaveBeenCalledWith(tracker, { currentAdIndex: 1, totalNumberOfAds: 2 });
    });
  });
});
