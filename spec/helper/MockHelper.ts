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
    };
  }

  export function getUiInstanceManagerMock(): UIInstanceManager {
    const UiInstanceManagerMockClass: jest.Mock<UIInstanceManager> = jest.fn().mockImplementation(() => ({
      onConfigured: getEventDispatcherMock(),
      getConfig: jest.fn().mockReturnValue({
        events: {
          onUpdated: getEventDispatcherMock(),
        },
      }),
      onControlsShow: getEventDispatcherMock(),
      onControlsHide: getEventDispatcherMock(),
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
