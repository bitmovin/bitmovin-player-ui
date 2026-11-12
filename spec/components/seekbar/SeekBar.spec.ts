import { MockHelper, TestingPlayerAPI } from '../../helper/MockHelper';
import { SeekBar } from '../../../src/ts/components/seekbar/SeekBar';
import { UIInstanceManager } from '../../../src/ts/UIManager';
import { Timeout } from '../../../src/ts/utils/Timeout';
import { DOM } from '../../../src/ts/DOM';
import { UIUtils } from '../../../src/ts/utils/UIUtils';

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

  describe('keyboard seeking', () => {
    let mockDomElement: ReturnType<typeof MockHelper.generateDOMMock>;
    let timeShiftSpy: jest.SpyInstance;
    let seekSpy: jest.SpyInstance;

    const pressKey = (keyCode: UIUtils.KeyCode) => {
      const keydownHandler = mockDomElement.on.mock.calls.find(([eventName]) => eventName === 'keydown')?.[1] as (
        event: KeyboardEvent,
      ) => void;
      expect(keydownHandler).toEqual(expect.any(Function));
      keydownHandler({ keyCode, preventDefault: jest.fn() } as unknown as KeyboardEvent);
    };

    // The UI manager dispatches onUpdated when a source is loaded or a UI variant is added for a loaded source.
    const dispatchUiUpdated = () => {
      const onUpdated = uiInstanceManagerMock.getConfig().events.onUpdated as unknown as {
        subscribe: jest.Mock<void, [() => void]>;
      };
      onUpdated.subscribe.mock.calls.forEach(([listener]) => listener());
    };

    const mockLiveSource = () => {
      jest.spyOn(playerMock, 'isLive').mockReturnValue(true);
      jest.spyOn(playerMock, 'getDuration').mockReturnValue(Infinity);
      jest.spyOn(playerMock, 'getMaxTimeShift').mockReturnValue(-60);
      jest.spyOn(playerMock, 'getTimeShift').mockReturnValue(-10);
    };

    const mockVodSource = () => {
      jest.spyOn(playerMock, 'isLive').mockReturnValue(false);
      jest.spyOn(playerMock, 'getDuration').mockReturnValue(100);
      jest.spyOn(playerMock, 'getCurrentTime').mockReturnValue(30);
    };

    beforeEach(() => {
      mockDomElement = MockHelper.generateDOMMock();
      jest.spyOn(seekbar, 'getDomElement').mockReturnValue(mockDomElement);
      timeShiftSpy = jest.spyOn(playerMock, 'timeShift');
      seekSpy = jest.spyOn(playerMock, 'seek');
    });

    it.each`
      smoothPlaybackPositionUpdateIntervalMs
      ${1}
      ${SeekBar.SMOOTH_PLAYBACK_POSITION_UPDATE_DISABLED}
    `(
      'should time-shift when configured while a live source is loaded (smoothPlaybackPositionUpdateIntervalMs=$smoothPlaybackPositionUpdateIntervalMs)',
      ({ smoothPlaybackPositionUpdateIntervalMs }) => {
        seekbar = new SeekBar({ smoothPlaybackPositionUpdateIntervalMs });
        // Build the child elements before replacing the root element with the mock
        seekbar.getDomElement();
        jest.spyOn(seekbar, 'getDomElement').mockReturnValue(mockDomElement);
        mockLiveSource();

        seekbar.configure(playerMock, uiInstanceManagerMock);
        // A UI variant added for an already loaded source receives onUpdated, without a change of the live state
        dispatchUiUpdated();

        pressKey(UIUtils.KeyCode.LeftArrow);
        expect(timeShiftSpy).toHaveBeenLastCalledWith(-11);

        pressKey(UIUtils.KeyCode.End);
        expect(timeShiftSpy).toHaveBeenLastCalledWith(0);
        expect(seekSpy).not.toHaveBeenCalled();
      },
    );

    it('should time-shift after a live source is loaded into a VOD-configured seek bar', () => {
      mockVodSource();
      seekbar.configure(playerMock, uiInstanceManagerMock);

      mockLiveSource();
      dispatchUiUpdated();
      pressKey(UIUtils.KeyCode.LeftArrow);

      expect(timeShiftSpy).toHaveBeenCalledWith(-11);
      expect(seekSpy).not.toHaveBeenCalled();
    });

    it('should seek again after switching from a live to a VOD source', () => {
      mockLiveSource();
      seekbar.configure(playerMock, uiInstanceManagerMock);

      mockVodSource();
      dispatchUiUpdated();
      pressKey(UIUtils.KeyCode.LeftArrow);

      expect(seekSpy).toHaveBeenCalledWith(29);
      expect(timeShiftSpy).not.toHaveBeenCalled();
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
