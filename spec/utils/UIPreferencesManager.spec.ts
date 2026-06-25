import { PlayerAPI, PlayerEvent } from 'bitmovin-player';
import { UIPreferencesManager } from '../../src/ts/utils/UIPreferencesManager';

describe('UIPreferencesManager', () => {
  const enabledKey = 'bitmovin.player.ui.preferences.enabled';
  const volumeKey = 'bitmovin.player.ui.preferences.volume';

  let playerMock: PlayerAPI;

  beforeEach(() => {
    localStorage.clear();
    playerMock = {
      exports: { PlayerEvent },
      on: jest.fn(),
      off: jest.fn(),
      getVolume: jest.fn(),
      isMuted: jest.fn(),
      getPlaybackSpeed: jest.fn(),
      setVolume: jest.fn(),
      mute: jest.fn(),
      unmute: jest.fn(),
      setPlaybackSpeed: jest.fn(),
    } as unknown as PlayerAPI;
  });

  it('ignores stored enabled state when the persistent preferences toggle is not configured', () => {
    localStorage.setItem(enabledKey, '1');
    localStorage.setItem(volumeKey, '30');

    new UIPreferencesManager().configure(playerMock, false, false);

    expect(playerMock.setVolume).not.toHaveBeenCalled();
    expect(playerMock.on).not.toHaveBeenCalled();
  });

  it('respects stored enabled state when the persistent preferences toggle is configured', () => {
    localStorage.setItem(enabledKey, '1');
    localStorage.setItem(volumeKey, '30');

    new UIPreferencesManager().configure(playerMock, false, true);

    expect(playerMock.setVolume).toHaveBeenCalledWith(30, 'ui-preferences');
    expect(playerMock.on).toHaveBeenCalled();
  });
});
