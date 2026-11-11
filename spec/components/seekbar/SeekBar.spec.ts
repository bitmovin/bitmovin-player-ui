import { MockHelper, TestingPlayerAPI } from '../../helper/MockHelper';
import { SeekBar } from '../../../src/ts/components/seekbar/SeekBar';
import { UIInstanceManager } from '../../../src/ts/UIManager';
import { Timeout } from '../../../src/ts/utils/Timeout';
import { DOM } from '../../../src/ts/DOM';
import { AdLinearityChangedEvent, PlayerEvent } from 'bitmovin-player';

let playerMock: TestingPlayerAPI;
let uiInstanceManagerMock: UIInstanceManager;

let seekbar: SeekBar;

describe('SeekBar', () => {
  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();

    seekbar = new SeekBar({ smoothPlaybackPositionUpdateIntervalMs: 1 });
    seekbar.getDomElement();
  });

  describe('becomes visible when switching from live to vod', () => {
    it('when live had no time shift', () => {
      jest.spyOn(playerMock, 'getMaxTimeShift').mockReturnValue(0);
      jest.spyOn(playerMock, 'isLive').mockReturnValue(true);
      jest.spyOn(playerMock, 'getDuration').mockReturnValue(Infinity);

      seekbar.configure(playerMock, uiInstanceManagerMock);

      jest.spyOn(playerMock, 'isLive').mockReturnValue(false);
      const showSpy = jest.spyOn(seekbar, 'show');

      playerMock.eventEmitter.fireDurationChangedEvent();

      expect(showSpy).toHaveBeenCalled();
    });
  });

  describe('disables smoothPlaybackPositionUpdater on Live Streams', () => {
    it('clears smoothPlaybackPositionUpdater when AD is finished', () => {
      jest.spyOn(playerMock, 'isLive').mockReturnValue(true);
      jest.spyOn(playerMock, 'getMaxTimeShift').mockReturnValue(-60);
      jest.spyOn(playerMock, 'getDuration').mockReturnValue(Infinity);
      seekbar.configure(playerMock, uiInstanceManagerMock);

      jest.spyOn(playerMock, 'isLive').mockReturnValue(false);
      playerMock.eventEmitter.fireAdBreakStartedEvent();

      const playbackUpdater: Timeout = (seekbar as any).smoothPlaybackPositionUpdater;
      const clearSpy = jest.spyOn(playbackUpdater, 'clear');

      jest.spyOn(playerMock, 'isLive').mockReturnValue(true);
      playerMock.eventEmitter.fireAdBreakFinishedEvent();

      expect(clearSpy).toHaveBeenCalled();
    });
  });

  describe('disabled state during ads', () => {
    let attributes: Map<string, string>;

    beforeEach(() => {
      // Track attributes on the DOM mock so the resulting accessible state can be asserted
      attributes = new Map<string, string>([['role', 'slider']]);
      const mockDomElement = MockHelper.generateDOMMock();
      mockDomElement.attr.mockImplementation((name: string, value: string) => {
        attributes.set(name, value);
        return mockDomElement;
      });
      mockDomElement.removeAttr.mockImplementation((name: string) => attributes.delete(name));
      jest.spyOn(seekbar, 'getDomElement').mockReturnValue(mockDomElement);
      jest.spyOn(playerMock, 'getDuration').mockReturnValue(100);

      seekbar.configure(playerMock, uiInstanceManagerMock);
    });

    it.each([
      { adType: 'linear', isLinear: true, expectedAriaDisabled: 'true' },
      { adType: 'non-linear', isLinear: false, expectedAriaDisabled: undefined },
    ])(
      'should set aria-disabled to $expectedAriaDisabled while a $adType ad is playing',
      ({ isLinear, expectedAriaDisabled }) => {
        playerMock.eventEmitter.fireAdStartedEvent({ isLinear });

        expect(attributes.get('aria-disabled')).toBe(expectedAriaDisabled);
        expect(attributes.get('role')).toBe('slider');
      },
    );

    it.each([
      { endEvent: 'AdBreakFinished', fireEndEvent: () => playerMock.eventEmitter.fireAdBreakFinishedEvent() },
      { endEvent: 'SourceUnloaded', fireEndEvent: () => playerMock.eventEmitter.fireSourceUnloadedEvent() },
    ])('should enable the seek bar again on $endEvent after a linear ad', ({ fireEndEvent }) => {
      playerMock.eventEmitter.fireAdStartedEvent({ isLinear: true });

      fireEndEvent();

      expect(seekbar.isEnabled()).toBe(true);
      expect(attributes.has('aria-disabled')).toBe(false);
    });

    it.each([
      { moment: 'before', disableBeforeAd: true },
      { moment: 'during', disableBeforeAd: false },
    ])('should keep a seek bar that was disabled $moment the linear ad disabled afterwards', ({ disableBeforeAd }) => {
      if (disableBeforeAd) {
        seekbar.disable();
      }
      playerMock.eventEmitter.fireAdStartedEvent({ isLinear: true });
      if (!disableBeforeAd) {
        seekbar.disable();
      }

      playerMock.eventEmitter.fireAdBreakFinishedEvent();

      expect(seekbar.isDisabled()).toBe(true);
      expect(attributes.get('aria-disabled')).toBe('true');
    });

    it('should keep the seek bar disabled until the ad break finishes when it is enabled during a linear ad', () => {
      playerMock.eventEmitter.fireAdStartedEvent({ isLinear: true });

      seekbar.enable();
      expect(seekbar.isDisabled()).toBe(true);

      playerMock.eventEmitter.fireAdBreakFinishedEvent();
      expect(seekbar.isEnabled()).toBe(true);
    });

    it.each([
      { from: 'linear', to: 'non-linear', startsLinear: true, isLinear: false, expectedAriaDisabled: undefined },
      { from: 'non-linear', to: 'linear', startsLinear: false, isLinear: true, expectedAriaDisabled: 'true' },
    ])(
      'should update aria-disabled when an ad switches from $from to $to',
      ({ startsLinear, isLinear, expectedAriaDisabled }) => {
        playerMock.eventEmitter.fireAdStartedEvent({ isLinear: startsLinear });

        playerMock.eventEmitter.fireEvent<AdLinearityChangedEvent>({
          type: PlayerEvent.AdLinearityChanged,
          timestamp: Date.now(),
          isLinear,
        });

        expect(attributes.get('aria-disabled')).toBe(expectedAriaDisabled);
      },
    );

    it.each([
      { state: 'during a linear ad', isLinear: true, expectedSeeks: 0 },
      { state: 'during a non-linear ad', isLinear: false, expectedSeeks: 1 },
    ])('should start $expectedSeeks seeks on pointer down $state', ({ isLinear, expectedSeeks }) => {
      const onSeekSpy = jest.fn();
      seekbar.onSeek.subscribe(onSeekSpy);
      const pointerDownHandler = (seekbar['seekBar'].on as jest.Mock).mock.calls.find(
        ([eventNames]) => eventNames === 'touchstart mousedown',
      )?.[1] as (event: Partial<MouseEvent>) => void;
      playerMock.eventEmitter.fireAdStartedEvent({ isLinear });

      pointerDownHandler({ preventDefault: jest.fn() });

      expect(onSeekSpy).toHaveBeenCalledTimes(expectedSeeks);
    });
  });

  describe('playback position', () => {
    let setPlaybackPositionSpy: jest.SpyInstance;

    beforeEach(() => {
      jest.spyOn(playerMock, 'getDuration').mockReturnValue(20);
      seekbar.configure(playerMock, uiInstanceManagerMock);

      setPlaybackPositionSpy = jest.spyOn(seekbar, 'setPlaybackPosition');
    });

    test.each`
      isLive   | isSeeking | timesCalled
      ${false} | ${true}   | ${0}
      ${true}  | ${true}   | ${0}
      ${false} | ${false}  | ${1}
      ${true}  | ${false}  | ${1}
    `(
      'will not be set when isLive=$isLive, isSeeking=$isSeeking and a stall ended event is fired',
      ({ isLive, isSeeking, timesCalled }) => {
        if (isLive) {
          jest.spyOn(playerMock, 'getMaxTimeShift').mockReturnValue(-60);
        }
        jest.spyOn(seekbar, 'isSeeking').mockReturnValue(isSeeking);
        jest.spyOn(playerMock, 'isLive').mockReturnValue(isLive);

        playerMock.eventEmitter.fireStallEndedEvent();

        expect(setPlaybackPositionSpy).toHaveBeenCalledTimes(timesCalled);
      },
    );

    it('will be moved after a successful seeked event', () => {
      playerMock.eventEmitter.fireSeekedEvent();
      expect(setPlaybackPositionSpy).toHaveBeenCalledTimes(1);
    });

    it('will move after a successful segment request download', () => {
      playerMock.eventEmitter.fireSegmentRequestFinished();
      expect(setPlaybackPositionSpy).toHaveBeenCalledTimes(1);
    });

    describe('vod event tracking', () => {
      let setBufferPositionSpy: jest.SpyInstance;

      beforeEach(() => {
        setBufferPositionSpy = jest.spyOn(seekbar, 'setBufferPosition');

        jest.spyOn(playerMock, 'getDuration').mockReturnValue(50);

        jest.spyOn(playerMock, 'getSeekableRange').mockImplementation(() => ({ start: 30, end: 40 }));

        const currentTime = 35;
        jest.spyOn(playerMock, 'getCurrentTime').mockReturnValue(currentTime);

        playerMock.eventEmitter.fireSeekEvent(currentTime);
        playerMock.eventEmitter.fireSeekedEvent();
      });

      it('will use the last known playback position location after a successful segment request download and the user is scrubbing', () => {
        const firstPlaybackPercentage = seekbar['playbackPositionPercentage'];

        jest.spyOn(playerMock, 'getSeekableRange').mockImplementation(() => ({ start: 26, end: 30 }));

        seekbar['onSeekPreviewEvent'](40, 100, true);

        playerMock.eventEmitter.fireSegmentRequestFinished();

        expect(setPlaybackPositionSpy).toHaveBeenLastCalledWith(firstPlaybackPercentage);

        const expectedPlaybackPercentage = 18;
        expect(setBufferPositionSpy).toHaveBeenLastCalledWith(expectedPlaybackPercentage);
      });

      it('will update the scrubber location after a successful segment request download and the user is not scrubbing', () => {
        jest.spyOn(playerMock, 'getSeekableRange').mockImplementation(() => ({ start: 26, end: 30 }));

        seekbar['onSeekPreviewEvent'](18, 100, false);

        playerMock.eventEmitter.fireSegmentRequestFinished();

        expect(setPlaybackPositionSpy).toHaveBeenLastCalledWith(18);
        expect(setBufferPositionSpy).toHaveBeenLastCalledWith(18);
      });
    });
  });

  describe('pending seek when the source is unloaded', () => {
    // The DOM is mocked, so the seeking state cannot be read back from the CSS class and is tracked here instead.
    let isSeekingState: boolean;

    beforeEach(() => {
      isSeekingState = false;
      jest.spyOn(seekbar, 'setSeeking').mockImplementation(seeking => {
        isSeekingState = seeking;
      });
      jest.spyOn(seekbar, 'isSeeking').mockImplementation(() => isSeekingState);

      jest.spyOn(playerMock, 'getDuration').mockReturnValue(20);
      seekbar.configure(playerMock, uiInstanceManagerMock);
    });

    it('leaves the seeking state so playback positions of the next source are applied again', () => {
      playerMock.eventEmitter.fireSeekEvent();
      expect(isSeekingState).toBe(true);

      // The seek never finishes, so no Seeked event is fired before the source goes away.
      playerMock.eventEmitter.fireSourceUnloadedEvent();
      expect(isSeekingState).toBe(false);

      const setPlaybackPositionSpy = jest.spyOn(seekbar, 'setPlaybackPosition');
      playerMock.eventEmitter.fireSourceLoadedEvent();
      playerMock.eventEmitter.fireStallEndedEvent();

      expect(setPlaybackPositionSpy).toHaveBeenCalled();
    });
  });

  describe('group playback', () => {
    beforeEach(() => {
      jest.spyOn(playerMock, 'getDuration').mockReturnValue(0);
      seekbar.configure(playerMock, uiInstanceManagerMock);
    });

    it('should suspend active group session on seeking', () => {
      const beginSuspensionSpy = jest.fn();
      (playerMock as any).groupPlayback = {
        hasJoined: () => true,
        beginSuspension: beginSuspensionSpy,
      };

      seekbar['onSeekEvent']();

      expect(seekbar['isUserSeeking']).toBe(true);
      expect(uiInstanceManagerMock.onSeek.dispatch).toHaveBeenCalled();
      expect(beginSuspensionSpy).toHaveBeenCalled();
    });
  });

  describe('buffer levels', () => {
    beforeEach(() => {
      jest.spyOn(playerMock, 'getDuration').mockReturnValue(20);
      jest.spyOn(playerMock, 'getMaxTimeShift').mockReturnValue(-60);

      seekbar.configure(playerMock, uiInstanceManagerMock);
    });

    test.each`
      isLive
      ${true}
      ${false}
    `('should get updated accordingly when a request has finished and isLive=$isLive', ({ isLive }) => {
      const setBufferPositionSpy = jest.spyOn(seekbar, 'setBufferPosition');
      jest.spyOn(playerMock, 'isLive').mockReturnValue(isLive);
      jest.spyOn(playerMock, 'getCurrentTime').mockReturnValue(35);
      jest.spyOn(playerMock, 'getSeekableRange').mockReturnValue({ start: 30, end: 40 });

      playerMock.eventEmitter.fireSegmentRequestFinished();

      expect(setBufferPositionSpy).toHaveBeenCalledTimes(1);
      expect(setBufferPositionSpy).toHaveBeenCalledWith(isLive ? 100 : 25);
    });
  });
});
