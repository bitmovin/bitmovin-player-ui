import { ToggleButton, ToggleButtonConfig } from './ToggleButton';
import { UIInstanceManager } from '../../UIManager';
import type { PlayerAPI, SubtitleEvent, SubtitleTrack } from 'bitmovin-player';
import { i18n } from '../../localization/i18n';

/**
 * A button that toggles the display of captions and subtitles.
 *
 * The button is hidden while the source provides no caption tracks, because there is nothing to
 * toggle in that case.
 *
 * When captions are switched on, the button restores the track that was enabled last. If no track
 * has been enabled yet, it prefers a track matching the current audio language and falls back to
 * the first available track.
 *
 * @category Buttons
 */
export class CaptionToggleButton extends ToggleButton<ToggleButtonConfig> {
  constructor(config: ToggleButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-captiontogglebutton',
        text: i18n.getLocalizer('settings.subtitles'),
        onAriaLabel: i18n.getLocalizer('captions.disable'),
        offAriaLabel: i18n.getLocalizer('captions.enable'),
      },
      this.config,
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    // The track to restore when captions are switched back on. Also updated for tracks enabled
    // elsewhere in the UI, so that the button and e.g. the subtitle list box agree on the selection.
    let lastEnabledTrackId: string | undefined;

    // The subtitles API is not available on every player/platform and can still be missing while no
    // source is loaded, so every access has to be guarded.
    const availableTracks = (): SubtitleTrack[] => player.subtitles?.list() ?? [];
    const enabledTracks = (): SubtitleTrack[] => availableTracks().filter(track => track.enabled);

    const trackToEnable = (): SubtitleTrack | undefined => {
      const tracks = availableTracks();
      const audioLanguage = player.getAudio()?.lang;

      return (
        tracks.find(track => track.id === lastEnabledTrackId) ??
        tracks.find(track => track.lang === audioLanguage) ??
        tracks[0]
      );
    };

    const captionStateHandler = () => {
      if (availableTracks().length === 0) {
        this.hide();
        return;
      }

      this.show();
      enabledTracks().length > 0 ? this.on() : this.off();
    };

    const subtitleEnabledHandler = (event: SubtitleEvent) => {
      if (event.subtitle) {
        lastEnabledTrackId = event.subtitle.id;
      }
      captionStateHandler();
    };

    const sourceUnloadedHandler = () => {
      // The restored track belongs to the previous source, so it must not leak into the next one.
      lastEnabledTrackId = undefined;
      captionStateHandler();
    };

    player.on(player.exports.PlayerEvent.SourceLoaded, captionStateHandler);
    player.on(player.exports.PlayerEvent.SourceUnloaded, sourceUnloadedHandler);
    player.on(player.exports.PlayerEvent.SubtitleAdded, captionStateHandler);
    player.on(player.exports.PlayerEvent.SubtitleRemoved, captionStateHandler);
    player.on(player.exports.PlayerEvent.SubtitleEnabled, subtitleEnabledHandler);
    player.on(player.exports.PlayerEvent.SubtitleDisabled, captionStateHandler);
    // Tracks can change between periods of the same source.
    player.on(player.exports.PlayerEvent.PeriodSwitched, captionStateHandler);
    uimanager.getConfig().events.onUpdated.subscribe(captionStateHandler);

    this.onClick.subscribe(() => {
      const currentlyEnabledTracks = enabledTracks();

      if (currentlyEnabledTracks.length > 0) {
        currentlyEnabledTracks.forEach(track => player.subtitles.disable(track.id));
      } else {
        const track = trackToEnable();

        if (track) {
          player.subtitles.enable(track.id, true);
        }
      }
    });

    // Startup init. The UI can be built lazily, so the initial state has to be derived from the
    // player instead of waiting for the next event.
    lastEnabledTrackId = enabledTracks().pop()?.id;
    captionStateHandler();
  }
}
