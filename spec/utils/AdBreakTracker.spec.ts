import { AdBreak, PlayerEvent } from 'bitmovin-player';
import { PlayerEventEmitter } from '../helper/PlayerEventEmitter';
import { AdBreakTracker } from '../../src/ts/utils/AdBreakTracker';

const makeBreak = (id: string | undefined, scheduleTime: number, ads: { id: string }[] = []): AdBreak =>
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

  describe('ad count filter', () => {
    beforeEach(() => {
      eventEmitter = new PlayerEventEmitter();
      player.on = eventEmitter.on.bind(eventEmitter);
      tracker.release();
      tracker = new AdBreakTracker(
        player,
        (ad, adBreak) => !ad?.id?.startsWith('bumper-') && !adBreak.id?.startsWith('bumper-'),
      );
    });

    it('filters the index and total within a break without mutating the player ads', () => {
      const ads = [{ id: 'bumper-intro' }, { id: 'a1' }, { id: 'bumper-middle' }, { id: 'a2' }];
      const adBreak = makeBreak('break-1', 5, ads);
      adsState.activeAdBreak = adBreak;
      const onChange = jest.fn();
      tracker.onAdCountChanged.subscribe(onChange);

      [0, 1, 0, 2].forEach((expectedIndex, index) => {
        adsState.activeAd = ads[index];
        eventEmitter.fireAdStartedEvent();

        expect(tracker.currentAdIndex).toBe(expectedIndex);
        expect(tracker.totalNumberOfAds).toBe(2);
        expect(onChange).toHaveBeenLastCalledWith(tracker, {
          currentAdIndex: expectedIndex,
          totalNumberOfAds: 2,
        });
      });

      expect(adBreak.ads).toEqual(ads);
      expect(adBreak.ads).toHaveLength(4);
    });

    it('does not count excluded breaks in the offsets or totals of subsequent breaks', () => {
      const breaks = [
        makeBreak('bumper-intro', 5, [{ id: 'intro' }]),
        makeBreak('break-1', 5, [{ id: 'a1' }]),
        makeBreak('bumper-middle', 5, [{ id: 'middle' }]),
        makeBreak('break-2', 5, [{ id: 'a2' }]),
        makeBreak('bumper-outro', 5, [{ id: 'outro' }]),
      ];

      [0, 1, 0, 2, 0].forEach((expectedIndex, index) => {
        adsState.activeAdBreak = breaks[index];
        adsState.activeAd = { id: breaks[index].ads[0].id };
        adsState.list = breaks.slice(index + 1);
        eventEmitter.fireAdStartedEvent();

        expect(tracker.currentAdIndex).toBe(expectedIndex);
        expect(tracker.totalNumberOfAds).toBe(2);

        adsState.activeAd = null;
        adsState.activeAdBreak = null;
        eventEmitter.fireAdBreakFinishedEvent(breaks[index]);
      });

      expect(tracker.currentAdIndex).toBe(0);
      expect(tracker.totalNumberOfAds).toBe(0);
    });

    it('does not substitute a provisional ad when every known ad is excluded', () => {
      adsState.activeAdBreak = makeBreak('break-1', 5, [{ id: 'bumper-intro' }]);
      adsState.activeAd = { id: 'bumper-intro' };
      adsState.list = [makeBreak('break-2', 5, [{ id: 'bumper-outro' }])];
      eventEmitter.fireAdStartedEvent();

      expect(tracker.currentAdIndex).toBe(0);
      expect(tracker.totalNumberOfAds).toBe(0);
    });

    it.each<[ads: AdBreak['ads']]>([[undefined], [[]]])('filters unloaded breaks using the break ID (ads: %p)', ads => {
      adsState.activeAdBreak = makeBreak('break-1', 5, [{ id: 'a1' }]);
      adsState.activeAd = { id: 'a1' };
      adsState.list = [
        { ...makeBreak('bumper-outro', 5), ads },
        { ...makeBreak('break-2', 5), ads },
      ];
      eventEmitter.fireAdStartedEvent();

      expect(tracker.currentAdIndex).toBe(1);
      expect(tracker.totalNumberOfAds).toBe(2);
    });

    it('retains an excluded active ad when its break never supplies an ads array', () => {
      const bumperBreak = makeBreak('break-1', 5);
      const nextBreak = makeBreak('break-2', 5, [{ id: 'a1' }]);
      adsState.activeAdBreak = bumperBreak;
      adsState.activeAd = { id: 'bumper-intro' };
      adsState.list = [nextBreak];
      eventEmitter.fireAdStartedEvent();

      expect(tracker.currentAdIndex).toBe(0);
      expect(tracker.totalNumberOfAds).toBe(1);

      adsState.activeAdBreak = nextBreak;
      adsState.activeAd = { id: 'a1' };
      adsState.list = [];
      eventEmitter.fireAdStartedEvent();

      expect(tracker.currentAdIndex).toBe(1);
      expect(tracker.totalNumberOfAds).toBe(1);
      expect(bumperBreak.ads).toEqual([]);
    });

    it('corrects provisional counts as a fresh break object supplies its ads', () => {
      adsState.activeAdBreak = makeBreak('break-1', 5);
      adsState.activeAd = { id: 'bumper-intro' };
      adsState.list = [makeBreak('break-2', 5)];
      eventEmitter.fireAdStartedEvent();
      expect(tracker.totalNumberOfAds).toBe(1);

      adsState.activeAdBreak = makeBreak('break-1', 5, [{ id: 'bumper-intro' }, { id: 'a1' }]);
      adsState.activeAd = { id: 'a1' };
      eventEmitter.fireAdStartedEvent();

      expect(tracker.currentAdIndex).toBe(1);
      expect(tracker.totalNumberOfAds).toBe(2);

      adsState.activeAdBreak = makeBreak('break-2', 5, [{ id: 'bumper-middle' }, { id: 'a2' }, { id: 'a3' }]);
      adsState.activeAd = { id: 'a2' };
      adsState.list = [];
      eventEmitter.fireAdStartedEvent();

      expect(tracker.currentAdIndex).toBe(2);
      expect(tracker.totalNumberOfAds).toBe(3);
    });

    it('counts ads with missing IDs and matches the active ad by reference', () => {
      const ad = {} as { id: string };
      adsState.activeAdBreak = makeBreak(undefined, 5, [{ id: 'bumper-intro' }, ad]);
      adsState.activeAd = ad;
      eventEmitter.fireAdStartedEvent();

      expect(tracker.currentAdIndex).toBe(1);
      expect(tracker.totalNumberOfAds).toBe(1);
    });
  });

  describe('single ad break (no subsequent ad breaks)', () => {
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

    it('resets currentAdIndex and totalNumberOfAds to 0 when a lone break finishes', () => {
      const ad = { id: 'a1' };
      const adBreak = makeBreak('break-1', 5, [ad]);
      adsState.activeAdBreak = adBreak;
      adsState.activeAd = ad;
      adsState.list = [];
      eventEmitter.fireAdStartedEvent();

      adsState.activeAd = null;
      adsState.activeAdBreak = null;
      eventEmitter.fireAdBreakFinishedEvent(adBreak);

      expect(tracker.currentAdIndex).toBe(0);
      expect(tracker.totalNumberOfAds).toBe(0);
    });
  });

  describe('subsequent ad breaks (same scheduleTime)', () => {
    it('shows currentAdIndex=1 and totalNumberOfAds=3 for the first of three subsequent single-ad breaks', () => {
      const break1 = makeBreak('break-1', 5, [{ id: 'a1' }]);
      const break2 = makeBreak('break-2', 5, [{ id: 'a2' }]);
      const break3 = makeBreak('break-3', 5, [{ id: 'a3' }]);

      adsState.activeAdBreak = break1;
      adsState.activeAd = { id: 'a1' };
      adsState.list = [break2, break3];
      eventEmitter.fireAdStartedEvent();

      expect(tracker.currentAdIndex).toBe(1);
      expect(tracker.totalNumberOfAds).toBe(3);
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

      // Between breaks no ad is active, so currentAdIndex is 0.
      // totalNumberOfAds is still derived from the retained group breaks + list.
      expect(tracker.currentAdIndex).toBe(0);
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

    it('resets to 0 after the last subsequent ad break finishes', () => {
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

      // No subsequent ad breaks remain: tracker resets so currentAdIndex=0 (no ad is active)
      expect(tracker.currentAdIndex).toBe(0);
      expect(tracker.totalNumberOfAds).toBe(0);
    });

    it('does not reset between breaks while subsequent ad breaks remain', () => {
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

      // Between breaks no ad is active, so currentAdIndex is 0.
      // Group is not reset: totalNumberOfAds still includes all breaks.
      expect(tracker.currentAdIndex).toBe(0);
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

      // No subsequent ad breaks remain after the last break finishes: tracker resets
      expect(tracker.currentAdIndex).toBe(0);
      expect(tracker.totalNumberOfAds).toBe(0);
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

    it('carries offset when the next break is already active before AdBreakFinished fires', () => {
      const break1 = makeBreak('break-1', 5, [{ id: 'a1' }]);
      const break2 = makeBreak('break-2', 5, [{ id: 'a2' }]);

      // Break 1 starts
      adsState.activeAdBreak = break1;
      adsState.activeAd = { id: 'a1' };
      adsState.list = [break2];
      eventEmitter.fireAdStartedEvent();

      expect(tracker.currentAdIndex).toBe(1);
      expect(tracker.totalNumberOfAds).toBe(2);

      // Break 2 becomes active before break 1's AdBreakFinished fires.
      // No dispatch happens between breaks (the next AdStarted will update the UI).
      adsState.activeAdBreak = break2;
      adsState.activeAd = { id: 'a2' };
      adsState.list = [];
      eventEmitter.fireAdBreakFinishedEvent(break1);

      // Break 2's AdStarted fires
      eventEmitter.fireAdStartedEvent();

      expect(tracker.currentAdIndex).toBe(2);
      expect(tracker.totalNumberOfAds).toBe(2);
    });

    it('handles subsequent ad breaks where each break contains multiple ads', () => {
      const ads1 = [{ id: 'a1' }, { id: 'a2' }];
      const ads2 = [{ id: 'a3' }, { id: 'a4' }];
      const break1 = makeBreak('break-1', 5, ads1);
      const break2 = makeBreak('break-2', 5, ads2);

      // Break 1, second ad playing
      adsState.activeAdBreak = break1;
      adsState.activeAd = ads1[1];
      adsState.list = [break2];
      eventEmitter.fireAdStartedEvent();

      expect(tracker.currentAdIndex).toBe(2);
      expect(tracker.totalNumberOfAds).toBe(4); // 2 from break1 + 2 from break2

      // Break 1 finishes
      adsState.activeAd = null;
      adsState.activeAdBreak = null;
      eventEmitter.fireAdBreakFinishedEvent(break1);

      // Break 2 starts, first ad
      adsState.activeAdBreak = break2;
      adsState.activeAd = ads2[0];
      adsState.list = [];
      eventEmitter.fireAdStartedEvent();

      expect(tracker.currentAdIndex).toBe(3);
      expect(tracker.totalNumberOfAds).toBe(4);
    });

    it('deduplicates freshly deserialized instances of the same ad break by ID', () => {
      const break2 = makeBreak('break-2', 5, [{ id: 'a3' }]);

      adsState.activeAdBreak = makeBreak('break-1', 5, [{ id: 'a1' }, { id: 'a2' }]);
      adsState.activeAd = { id: 'a1' };
      adsState.list = [break2];
      eventEmitter.fireAdStartedEvent();

      // A player adapter may deserialize the same ad break again for the next AdStarted event.
      adsState.activeAdBreak = makeBreak('break-1', 5, [{ id: 'a1' }, { id: 'a2' }]);
      adsState.activeAd = { id: 'a2' };
      adsState.list = [break2];
      eventEmitter.fireAdStartedEvent();

      expect(tracker.currentAdIndex).toBe(2);
      expect(tracker.totalNumberOfAds).toBe(3);
    });

    it('keeps distinct ad breaks when their IDs are missing', () => {
      const break1 = makeBreak(undefined, 5, [{ id: 'a1' }]);
      const break2 = makeBreak(undefined, 5, [{ id: 'a2' }]);

      adsState.activeAdBreak = break1;
      adsState.activeAd = { id: 'a1' };
      adsState.list = [break2];
      eventEmitter.fireAdStartedEvent();

      adsState.activeAdBreak = break2;
      adsState.activeAd = { id: 'a2' };
      adsState.list = [];
      eventEmitter.fireAdStartedEvent();

      expect(tracker.currentAdIndex).toBe(2);
      expect(tracker.totalNumberOfAds).toBe(2);
    });

    it('dispatches onAdCountChanged with currentAdIndex and totalNumberOfAds after AdStarted', () => {
      const break1 = makeBreak('break-1', 5, [{ id: 'a1' }]);
      const break2 = makeBreak('break-2', 5, [{ id: 'a2' }]);
      const onChange = jest.fn();
      tracker.onAdCountChanged.subscribe(onChange);

      adsState.activeAdBreak = break1;
      adsState.activeAd = { id: 'a1' };
      adsState.list = [break2];
      eventEmitter.fireAdStartedEvent();

      expect(onChange).toHaveBeenCalledWith(tracker, { currentAdIndex: 1, totalNumberOfAds: 2 });
    });

    it('does not dispatch onAdCountChanged on AdBreakFinished when more breaks remain in the group', () => {
      const break1 = makeBreak('break-1', 5, [{ id: 'a1' }]);
      const break2 = makeBreak('break-2', 5, [{ id: 'a2' }]);
      const onChange = jest.fn();

      adsState.activeAdBreak = break1;
      adsState.activeAd = { id: 'a1' };
      adsState.list = [break2];
      eventEmitter.fireAdStartedEvent();

      tracker.onAdCountChanged.subscribe(onChange);
      adsState.activeAd = null;
      adsState.activeAdBreak = null;
      eventEmitter.fireAdBreakFinishedEvent(break1);

      // No dispatch between breaks — the next AdStarted will provide up-to-date values
      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
