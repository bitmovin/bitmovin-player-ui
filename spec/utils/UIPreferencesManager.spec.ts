import { PlayerAPI, PlayerEvent } from 'bitmovin-player';
import { UIPreferencesManager } from '../../src/ts/utils/UIPreferencesManager';
import { prefixCss } from '../../src/ts/components/DummyComponent';

describe('UIPreferencesManager', () => {
  const storageKeyPrefix = `${prefixCss('preferences')}.`;
  const enabledKey = storageKeyPrefix + 'enabled';
  const volumeKey = storageKeyPrefix + 'volume';

  let playerMock: PlayerAPI;
  let onMock: jest.Mock;
  let setVolumeMock: jest.Mock;

  beforeEach(() => {
    localStorage.clear();
    onMock = jest.fn();
    setVolumeMock = jest.fn();
    playerMock = {
      exports: { PlayerEvent },
      on: onMock,
      off: jest.fn(),
      getVolume: jest.fn(),
      isMuted: jest.fn(),
      getPlaybackSpeed: jest.fn(),
      setVolume: setVolumeMock,
      mute: jest.fn(),
      unmute: jest.fn(),
      setPlaybackSpeed: jest.fn(),
    } as unknown as PlayerAPI;
  });

  it('ignores stored enabled state when the persistent preferences toggle is not configured', () => {
    localStorage.setItem(enabledKey, '1');
    localStorage.setItem(volumeKey, '30');

    new UIPreferencesManager().configure(playerMock, false, false);

    expect(setVolumeMock).not.toHaveBeenCalled();
    expect(onMock).not.toHaveBeenCalled();
  });

  it('respects stored enabled state when the persistent preferences toggle is configured', () => {
    localStorage.setItem(enabledKey, '1');
    localStorage.setItem(volumeKey, '30');

    new UIPreferencesManager().configure(playerMock, false, true);

    expect(setVolumeMock).toHaveBeenCalledWith(30, 'ui-preferences');
    expect(onMock).toHaveBeenCalled();
  });
});
