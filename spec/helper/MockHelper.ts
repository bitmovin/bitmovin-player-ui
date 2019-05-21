import {
  AdBreakEvent,
  AdEvent,
  AirplayChangedEvent,
  ErrorEvent,
  LinearAd,
  PlaybackEvent,
  PlayerAPI,
  PlayerEvent,
  PlayerEventBase,
  PlayerEventCallback,
  SeekEvent,
  TimeShiftEvent,
  VideoPlaybackQualityChangedEvent,
} from 'bitmovin-player';
import { UIInstanceManager } from '../../src/ts/uimanager';
import { DOM } from '../../src/ts/dom';

jest.mock('../../src/ts/dom');

export namespace MockHelper {
  export function getUiInstanceManagerMock(): UIInstanceManager {
    const eventDispatcherMock = {
      subscribe: jest.fn(),
    };

    const UiInstanceManagerMockClass: jest.Mock<UIInstanceManager> = jest.fn().mockImplementation(() => ({
      onConfigured: eventDispatcherMock,
      getConfig: jest.fn().mockReturnValue({
        events: {
          onUpdated: eventDispatcherMock,
        },
      }),
      onControlsShow: eventDispatcherMock,
      onControlsHide: eventDispatcherMock,
    }));

    return new UiInstanceManagerMockClass();
  }

  export function generateDOMMock(): DOM {
    const DOMClass: jest.Mock<DOM> = jest.fn().mockImplementation(() => ({
      addClass: jest.fn(),
      removeClass: jest.fn(),
      on: jest.fn(),
      html: jest.fn(),
      css: jest.fn(),
      width: jest.fn(),
    }));

    return new DOMClass();
  }

  export function getPlayerMock(): TestingPlayerAPI {
    const eventHelper = new EventEmitter();

    const PlayerMockClass: jest.Mock<TestingPlayerAPI> = jest.fn().mockImplementation(() => {
      return {
        ads: jest.fn(),
        getSource: jest.fn(),
        exports: {
          PlayerEvent,
          ViewMode: {
            Fullscreen: 'fullscreen',
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
        getMaxTimeShift: jest.fn(),
        hasEnded: jest.fn(),
        isStalled: jest.fn(),
        isCasting: jest.fn(),

        // Event faker
        eventEmitter: eventHelper,
        on: eventHelper.on.bind(eventHelper),
      };
    });

    return new PlayerMockClass();
  }
}
