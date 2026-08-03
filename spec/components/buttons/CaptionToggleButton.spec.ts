import { MockHelper, TestingPlayerAPI } from '../../helper/MockHelper';
import { UIInstanceManager } from '../../../src/ts/UIManager';
import { CaptionToggleButton } from '../../../src/ts/components/buttons/CaptionToggleButton';
import { PlayerEvent, SubtitleTrack } from 'bitmovin-player';

let playerMock: TestingPlayerAPI;
let uiInstanceManagerMock: UIInstanceManager;

let captionToggleButton: CaptionToggleButton;

function setupSubtitles(tracks: Array<Partial<SubtitleTrack>>): void {
  (playerMock as any).subtitles = {
    list: jest.fn().mockImplementation(() => tracks as SubtitleTrack[]),
    enable: jest.fn(),
    disable: jest.fn(),
  };
}

describe('CaptionToggleButton', () => {
  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();

    captionToggleButton = new CaptionToggleButton();
    captionToggleButton.initialize();

    // Setup DOM Mock
    const mockDomElement = MockHelper.generateDOMMock();
    jest.spyOn(captionToggleButton, 'getDomElement').mockReturnValue(mockDomElement);
  });

  describe('visibility', () => {
    it('is hidden when no caption tracks are available', () => {
      setupSubtitles([]);

      captionToggleButton.configure(playerMock, uiInstanceManagerMock);

      expect(captionToggleButton.isHidden()).toBe(true);
    });

    it('is visible when caption tracks are available', () => {
      setupSubtitles([{ id: 'en', lang: 'en', enabled: false }]);

      captionToggleButton.configure(playerMock, uiInstanceManagerMock);

      expect(captionToggleButton.isHidden()).toBe(false);
    });

    it('is hidden when the subtitles API is not available', () => {
      (playerMock as any).subtitles = undefined;

      captionToggleButton.configure(playerMock, uiInstanceManagerMock);

      expect(captionToggleButton.isHidden()).toBe(true);
    });

    it('becomes visible when a caption track is added', () => {
      const tracks: Array<Partial<SubtitleTrack>> = [];
      setupSubtitles(tracks);

      captionToggleButton.configure(playerMock, uiInstanceManagerMock);
      expect(captionToggleButton.isHidden()).toBe(true);

      tracks.push({ id: 'en', lang: 'en', enabled: false });
      playerMock.eventEmitter.fireSubtitleAddedEvent('en', 'English');

      expect(captionToggleButton.isHidden()).toBe(false);
    });
  });

  describe('toggle state', () => {
    it('is off when no caption track is enabled', () => {
      setupSubtitles([{ id: 'en', lang: 'en', enabled: false }]);

      captionToggleButton.configure(playerMock, uiInstanceManagerMock);

      expect(captionToggleButton.isOff()).toBe(true);
    });

    it('is on when a caption track is already enabled', () => {
      setupSubtitles([{ id: 'en', lang: 'en', enabled: true }]);

      captionToggleButton.configure(playerMock, uiInstanceManagerMock);

      expect(captionToggleButton.isOn()).toBe(true);
    });

    it('turns on when captions are enabled elsewhere in the UI', () => {
      const tracks: Array<Partial<SubtitleTrack>> = [{ id: 'en', lang: 'en', enabled: false }];
      setupSubtitles(tracks);

      captionToggleButton.configure(playerMock, uiInstanceManagerMock);

      tracks[0].enabled = true;
      playerMock.eventEmitter.fireSubtitleEnabled({ id: 'en' });

      expect(captionToggleButton.isOn()).toBe(true);
    });

    it('turns off when captions are disabled elsewhere in the UI', () => {
      const tracks: Array<Partial<SubtitleTrack>> = [{ id: 'en', lang: 'en', enabled: true }];
      setupSubtitles(tracks);

      captionToggleButton.configure(playerMock, uiInstanceManagerMock);

      tracks[0].enabled = false;
      playerMock.eventEmitter.fireSubtitleDisabled();

      expect(captionToggleButton.isOff()).toBe(true);
    });
  });

  describe('on click', () => {
    it('disables all enabled caption tracks when captions are on', () => {
      setupSubtitles([
        { id: 'en', lang: 'en', enabled: true },
        { id: 'de', lang: 'de', enabled: false },
      ]);

      captionToggleButton.configure(playerMock, uiInstanceManagerMock);
      captionToggleButton['onClickEvent']();

      expect(playerMock.subtitles.disable).toHaveBeenCalledWith('en');
      expect(playerMock.subtitles.disable).toHaveBeenCalledTimes(1);
    });

    it('does nothing when no caption tracks are available', () => {
      setupSubtitles([]);

      captionToggleButton.configure(playerMock, uiInstanceManagerMock);
      captionToggleButton['onClickEvent']();

      expect(playerMock.subtitles.enable).not.toHaveBeenCalled();
      expect(playerMock.subtitles.disable).not.toHaveBeenCalled();
    });

    describe('track selection when captions are off', () => {
      it('prefers a track matching the current audio language', () => {
        setupSubtitles([
          { id: 'fr', lang: 'fr', enabled: false },
          { id: 'de', lang: 'de', enabled: false },
        ]);
        jest.spyOn(playerMock, 'getAudio').mockReturnValue({ lang: 'de' } as any);

        captionToggleButton.configure(playerMock, uiInstanceManagerMock);
        captionToggleButton['onClickEvent']();

        expect(playerMock.subtitles.enable).toHaveBeenCalledWith('de', true);
      });

      it('falls back to the first available track when no track matches the audio language', () => {
        setupSubtitles([
          { id: 'fr', lang: 'fr', enabled: false },
          { id: 'de', lang: 'de', enabled: false },
        ]);
        jest.spyOn(playerMock, 'getAudio').mockReturnValue({ lang: 'es' } as any);

        captionToggleButton.configure(playerMock, uiInstanceManagerMock);
        captionToggleButton['onClickEvent']();

        expect(playerMock.subtitles.enable).toHaveBeenCalledWith('fr', true);
      });

      it('falls back to the first available track when no audio language is reported', () => {
        setupSubtitles([
          { id: 'fr', lang: 'fr', enabled: false },
          { id: 'de', lang: 'de', enabled: false },
        ]);
        jest.spyOn(playerMock, 'getAudio').mockReturnValue(undefined as any);

        captionToggleButton.configure(playerMock, uiInstanceManagerMock);
        captionToggleButton['onClickEvent']();

        expect(playerMock.subtitles.enable).toHaveBeenCalledWith('fr', true);
      });

      it('restores the track that was enabled last instead of the audio language match', () => {
        const tracks: Array<Partial<SubtitleTrack>> = [
          { id: 'en', lang: 'en', enabled: false },
          { id: 'de', lang: 'de', enabled: false },
        ];
        setupSubtitles(tracks);
        jest.spyOn(playerMock, 'getAudio').mockReturnValue({ lang: 'en' } as any);

        captionToggleButton.configure(playerMock, uiInstanceManagerMock);

        // The user picks German somewhere else in the UI, then toggles captions off and on again.
        tracks[1].enabled = true;
        playerMock.eventEmitter.fireSubtitleEnabled({ id: 'de' });
        tracks[1].enabled = false;
        playerMock.eventEmitter.fireSubtitleDisabled();

        captionToggleButton['onClickEvent']();

        expect(playerMock.subtitles.enable).toHaveBeenCalledWith('de', true);
      });
    });
  });

  describe('on release', () => {
    it('unregisters all player event handlers', () => {
      setupSubtitles([{ id: 'en', lang: 'en', enabled: false }]);
      const off = jest.spyOn(playerMock, 'off');

      captionToggleButton.configure(playerMock, uiInstanceManagerMock);
      captionToggleButton.release();

      const unregisteredEvents = off.mock.calls.map(([event]) => event);
      expect(unregisteredEvents).toEqual(
        expect.arrayContaining([
          PlayerEvent.SourceLoaded,
          PlayerEvent.SourceUnloaded,
          PlayerEvent.SubtitleAdded,
          PlayerEvent.SubtitleRemoved,
          PlayerEvent.SubtitleEnabled,
          PlayerEvent.SubtitleDisabled,
          PlayerEvent.PeriodSwitched,
        ]),
      );
    });

    it('unsubscribes from the uimanager onUpdated event', () => {
      setupSubtitles([{ id: 'en', lang: 'en', enabled: false }]);

      captionToggleButton.configure(playerMock, uiInstanceManagerMock);
      captionToggleButton.release();

      expect(uiInstanceManagerMock.getConfig().events.onUpdated.unsubscribe).toHaveBeenCalled();
    });

    it('stays inert when a late event is still delivered after release', () => {
      const tracks: Array<Partial<SubtitleTrack>> = [{ id: 'en', lang: 'en', enabled: false }];
      setupSubtitles(tracks);

      captionToggleButton.configure(playerMock, uiInstanceManagerMock);
      captionToggleButton.release();

      // The player mock does not actually deregister handlers, which conveniently exercises the
      // released state: a handler that still fires must not touch the player reference anymore.
      tracks[0].enabled = true;
      expect(() => playerMock.eventEmitter.fireSubtitleEnabled({ id: 'en' })).not.toThrow();
      expect(captionToggleButton.isOff()).toBe(true);
    });
  });

  describe('on source unloaded', () => {
    it('does not restore a track of the previous source', () => {
      const tracks: Array<Partial<SubtitleTrack>> = [
        { id: 'en', lang: 'en', enabled: false },
        { id: 'de', lang: 'de', enabled: true },
      ];
      setupSubtitles(tracks);

      captionToggleButton.configure(playerMock, uiInstanceManagerMock);
      expect(captionToggleButton.isOn()).toBe(true);

      tracks.length = 0;
      playerMock.eventEmitter.fireSourceUnloadedEvent();
      expect(captionToggleButton.isHidden()).toBe(true);

      // A new source provides its own tracks, so the previous selection must not be restored.
      tracks.push({ id: 'en', lang: 'en', enabled: false }, { id: 'de', lang: 'de', enabled: false });
      playerMock.eventEmitter.fireSourceLoadedEvent();
      captionToggleButton['onClickEvent']();

      expect(playerMock.subtitles.enable).toHaveBeenCalledWith('en', true);
    });
  });
});
