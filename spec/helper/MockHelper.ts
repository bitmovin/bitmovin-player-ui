import { PlayerAPI, PlayerEvent } from 'bitmovin-player';
import { UIInstanceManager } from '../../src/ts/UIManager';
import { DOM } from '../../src/ts/DOM';
import { PlayerEventEmitter } from './PlayerEventEmitter';
import { UIContainer } from '../../src/ts/components/UIContainer';
import { SubtitleSettingsManager } from '../../src/ts/utils/SubtitleSettingsManager';

jest.mock('../../src/ts/DOM');

export interface TestingPlayerAPI extends PlayerAPI {
  eventEmitter: PlayerEventEmitter;
}

export namespace MockHelper {
  export function getEventDispatcherMock() {
    return {
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      subscribeRateLimited: jest.fn(),
      dispatch: jest.fn(),
    };
  }

  export function getMockCall(mockFn: jest.Mock, { call = 0 }: { call?: number } = {}): unknown[] {
    const calls = mockFn.mock.calls;
    if (call < 0 || call >= calls.length) {
      throw new Error(`Expected call index ${call} but only ${calls.length} calls were recorded.`);
    }
    return calls[call];
  }

  export function getMockCallArg<T>(mockFn: jest.Mock, { call = 0, arg = 0 }: { call?: number; arg?: number } = {}): T {
    const callArgs = getMockCall(mockFn, { call });
    if (arg < 0 || arg >= callArgs.length) {
      throw new Error(`Expected argument index ${arg} but call has ${callArgs.length} arguments.`);
    }
    return callArgs[arg] as T;
  }

  export function getUiMock(): UIContainer {
    return {
      onPlayerStateChange: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
    } as unknown as UIContainer;
  }

  export function getUiInstanceManagerMock(): UIInstanceManager {
    const uiMock = getUiMock();
    const UiInstanceManagerMockClass: jest.Mock<UIInstanceManager> = jest.fn().mockImplementation(() => ({
      onConfigured: getEventDispatcherMock(),
      getSubtitleSettingsManager: jest.fn().mockReturnValue(new SubtitleSettingsManager()),
      getConfig: jest.fn().mockReturnValue({
        events: {
          onUpdated: getEventDispatcherMock(),
        },
        metadata: {
          markers: [],
        },
      }),
      getUI: () => uiMock,
      onControlsShow: getEventDispatcherMock(),
      onControlsHide: getEventDispatcherMock(),
      onComponentHide: getEventDispatcherMock(),
      onComponentShow: getEventDispatcherMock(),
      onSeekPreview: getEventDispatcherMock(),
      onSeek: getEventDispatcherMock(),
      onSeeked: getEventDispatcherMock(),
      onRelease: getEventDispatcherMock(),
      onComponentViewModeChanged: getEventDispatcherMock(),
      uiWrapperElement: generateDOMMock(),
    }));

    return new UiInstanceManagerMockClass();
  }

  export function generateDOMMock(): jest.Mocked<DOM> {
    const mockedDomElement = {
      addClass: jest.fn(),
      removeClass: jest.fn(),
      hasClass: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      html: jest.fn(),
      css: jest.fn(),
      width: jest.fn(),
      height: jest.fn(),
      size: jest.fn(),
      empty: jest.fn(),
      append: jest.fn(),
      attr: jest.fn(),
      get: jest.fn(),
    };

    const DOMClass: jest.Mock<DOM> = jest.fn().mockImplementation(() => ({
      ...mockedDomElement,
      css: jest.fn().mockReturnValue(mockedDomElement),
    }));

    return new DOMClass() as jest.Mocked<DOM>;
  }

  export function getPlayerMock(): TestingPlayerAPI {
    const eventHelper = new PlayerEventEmitter();

    const PlayerMockClass: jest.Mock<TestingPlayerAPI> = jest.fn().mockImplementation(() => {
      return {
        ads: jest.fn(),
        subtitles: jest.fn(),
        getSource: jest.fn(),
        exports: {
          PlayerEvent,
          ViewMode: {
            Fullscreen: 'fullscreen',
            PictureInPicture: 'pictureinpicture',
          },
        },
        isLive: jest.fn(),
        getConfig: jest.fn(() => {
          return {};
        }),
        isPlaying: jest.fn(),
        isPaused: jest.fn(),
        isAirplayActive: jest.fn(),
        isAirplayAvailable: jest.fn(),
        getPlayerType: jest.fn(),
        getStreamType: jest.fn(),
        getDuration: jest.fn(),
        getVolume: jest.fn(),
        getContainer: jest.fn(() => {
          return document.getElementById('player');
        }),
        getViewMode: jest.fn(),
        getTimeShift: jest.fn(),
        getCurrentTime: jest.fn(),
        getMaxTimeShift: jest.fn(),
        getAvailableAudio: jest.fn(),
        getAudio: jest.fn(),
        getThumbnail: jest.fn(),
        getSeekableRange: jest.fn(() => {
          return { start: 0, end: 0 };
        }),
        getVideoBufferLength: jest.fn(),
        getAudioBufferLength: jest.fn(),
        hasEnded: jest.fn(),
        isStalled: jest.fn(),
        isCasting: jest.fn(),
        isViewModeAvailable: jest.fn(),
        seek: jest.fn(),
        isMuted: jest.fn(),
        mute: jest.fn(),
        unmute: jest.fn(),
        setVolume: jest.fn(),
        setAudio: jest.fn(),

        // Event faker
        eventEmitter: eventHelper,
        on: eventHelper.on.bind(eventHelper),
        off: jest.fn(),
      };
    });

    return new PlayerMockClass();
  }
}
