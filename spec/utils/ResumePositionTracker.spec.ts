import { ResumePositionTracker } from '../../src/ts/utils/ResumePositionTracker';
import { StorageUtils } from '../../src/ts/utils/StorageUtils';
import { MockHelper, TestingPlayerAPI } from '../helper/MockHelper';

describe('ResumePositionTracker', () => {
  const sourceUrl = 'https://cdn.example/m.mpd';
  const storageKey = resumeStorageKeyForSourceIdentifier(`dash:${sourceUrl}`);
  let player: TestingPlayerAPI;
  let tracker: ResumePositionTracker | undefined;

  beforeEach(() => {
    tracker = undefined;
    StorageUtils.setStorageApiDisabled({ disableStorageApi: false });
    window.localStorage.clear();
    player = MockHelper.getPlayerMock();
    (player.getSource as jest.Mock).mockReturnValue({ dash: sourceUrl });
    (player.isLive as jest.Mock).mockReturnValue(false);
  });

  afterEach(() => {
    tracker?.release();
  });

  it('seeks to a saved position when the source is already loaded', () => {
    window.localStorage.setItem(storageKey, '90');

    tracker = new ResumePositionTracker(player);

    const seekMock = (player as unknown as { seek: jest.Mock }).seek;
    expect(seekMock).toHaveBeenCalledWith(90, 'ui');
  });

  it('seeks to a saved position when a matching source is loaded later', () => {
    (player.getSource as jest.Mock).mockReturnValue(null);
    window.localStorage.setItem(storageKey, '90');
    tracker = new ResumePositionTracker(player);

    (player.getSource as jest.Mock).mockReturnValue({ dash: sourceUrl });
    player.eventEmitter.fireSourceLoadedEvent();

    const seekMock = (player as unknown as { seek: jest.Mock }).seek;
    expect(seekMock).toHaveBeenCalledWith(90, 'ui');
  });

  it('stores the current position when playback is paused', () => {
    (player.getCurrentTime as jest.Mock).mockReturnValue(120);
    tracker = new ResumePositionTracker(player);

    player.eventEmitter.firePauseEvent();

    expect(window.localStorage.getItem(storageKey)).toBe('120');
    expect(window.localStorage.key(0)).toBe(storageKey);
    expect(storageKey).not.toContain(sourceUrl);
  });

  it('stores the last known position when the source is unloaded', () => {
    tracker = new ResumePositionTracker(player);
    player.eventEmitter.fireTimeChangedEvent(120);
    (player.getCurrentTime as jest.Mock).mockReturnValue(0);

    player.eventEmitter.fireSourceUnloadedEvent();

    expect(window.localStorage.getItem(storageKey)).toBe('120');
  });

  it('removes the saved position when playback is near the start', () => {
    window.localStorage.setItem(storageKey, '90');
    (player.getCurrentTime as jest.Mock).mockReturnValue(2);
    tracker = new ResumePositionTracker(player);

    player.eventEmitter.firePauseEvent();

    expect(window.localStorage.getItem(storageKey)).toBeNull();
  });

  it('removes the saved position when playback finishes', () => {
    window.localStorage.setItem(storageKey, '90');
    tracker = new ResumePositionTracker(player);

    player.eventEmitter.firePlaybackFinishedEvent();

    expect(window.localStorage.getItem(storageKey)).toBeNull();
  });

  it('does not resume live sources', () => {
    (player.isLive as jest.Mock).mockReturnValue(true);
    window.localStorage.setItem(storageKey, '90');

    tracker = new ResumePositionTracker(player);

    const seekMock = (player as unknown as { seek: jest.Mock }).seek;
    expect(seekMock).not.toHaveBeenCalled();
  });
});

function resumeStorageKeyForSourceIdentifier(sourceIdentifier: string): string {
  let hash = 0;
  for (let i = 0; i < sourceIdentifier.length; i++) {
    hash = (hash << 5) - hash + sourceIdentifier.charCodeAt(i);
    hash |= 0;
  }
  return `bitmovin.player.ui.resume.${(hash >>> 0).toString(36)}`;
}
