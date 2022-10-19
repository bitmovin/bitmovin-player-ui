import { PlayerAPI, PlayerEvent } from 'bitmovin-player';
import { UIInstanceManager } from '../../src/ts/uimanager';
import { DOM } from '../../src/ts/dom';
import { PlayerEventEmitter } from './PlayerEventEmitter';

jest.mock('../../src/ts/dom');

export interface TestingPlayerAPI extends PlayerAPI {
  eventEmitter: PlayerEventEmitter;
}

export namespace MockHelper {
  export function getEventDispatcherMock() {
    return {
      subscribe: jest.fn(),
      subscribeRateLimited: jest.fn(),
      dispatch: jest.fn(),
    };
  }

  export function getUiInstanceManagerMock(): UIInstanceManager {
    const UiInstanceManagerMockClass: jest.Mock<UIInstanceManager> = jest.fn().mockImplementation(() => ({
      onConfigured: getEventDispatcherMock(),
      getConfig: jest.fn().mockReturnValue({
        events: {
          onUpdated: getEventDispatcherMock(),
        },
        metadata: {
          markers: [],
        },
      }),
      onControlsShow: getEventDispatcherMock(),
      onControlsHide: getEventDispatcherMock(),
      onComponentHide: getEventDispatcherMock(),
      onComponentShow: getEventDispatcherMock(),
      onSeekPreview: getEventDispatcherMock(),
      onSeek: getEventDispatcherMock(),
      onSeeked: getEventDispatcherMock(),
      onRelease: getEventDispatcherMock(),
    }));

    return new UiInstanceManagerMockClass();
  }

  export function generateDOMMock(): jest.Mocked<DOM> {
    const DOMClass: jest.Mock<DOM> = jest.fn().mockImplementation(() => ({
      addClass: jest.fn(),
      removeClass: jest.fn(),
      on: jest.fn(),
      html: jest.fn(),
      css: jest.fn(),
      width: jest.fn(),
      height: jest.fn(),
      size: jest.fn(),
      empty: jest.fn(),
      append: jest.fn(),
      attr: jest.fn(),
      get: jest.fn(),
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

        // Event faker
        eventEmitter: eventHelper,
        on: eventHelper.on.bind(eventHelper),
      };
    });

    return new PlayerMockClass();
  }
}
