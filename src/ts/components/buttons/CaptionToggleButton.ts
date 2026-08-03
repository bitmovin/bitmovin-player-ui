import { ToggleButton, ToggleButtonConfig } from './ToggleButton';
import { UIInstanceManager } from '../../UIManager';
import { PlayerAPI, SubtitleEvent, SubtitleTrack } from 'bitmovin-player';
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
  private player: PlayerAPI;
  private uimanager: UIInstanceManager;

  /**
   * The track to restore when captions are switched back on. Kept up to date for tracks enabled
   * elsewhere in the UI too, so that the button and e.g. the subtitle list box agree on the
   * selection.
   */
  private lastEnabledTrackId: string | undefined = undefined;

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
    this.player = player;
    this.uimanager = uimanager;

    player.on(player.exports.PlayerEvent.SourceLoaded, this.onPlayerStateChanged);
    player.on(player.exports.PlayerEvent.SourceUnloaded, this.onSourceUnloaded);
    player.on(player.exports.PlayerEvent.SubtitleAdded, this.onPlayerStateChanged);
    player.on(player.exports.PlayerEvent.SubtitleRemoved, this.onPlayerStateChanged);
    player.on(player.exports.PlayerEvent.SubtitleEnabled, this.onSubtitleEnabled);
    player.on(player.exports.PlayerEvent.SubtitleDisabled, this.onPlayerStateChanged);
    // Tracks can change between periods of the same source.
    player.on(player.exports.PlayerEvent.PeriodSwitched, this.onPlayerStateChanged);
    uimanager.getConfig().events.onUpdated.subscribe(this.onPlayerStateChanged);

    this.onClick.subscribe(() => {
      if (this.availableTracks().length === 0) {
        return;
      }

      const enabledTracks = this.enabledTracks();

      if (enabledTracks.length > 0) {
        enabledTracks.forEach(track => player.subtitles.disable(track.id));
      } else {
        const track = this.trackToEnable();

        if (track) {
          player.subtitles.enable(track.id, true);
        }
      }
    });

    // Startup init. The UI can be built lazily, so the initial state has to be derived from the
    // player instead of waiting for the next event.
    const initiallyEnabledTrack = this.enabledTracks().pop();
    if (initiallyEnabledTrack) {
      this.lastEnabledTrackId = initiallyEnabledTrack.id;
    }
    this.updateState();
  }

  // The subtitles API is not available on every player/platform and can still be missing while no
  // source is loaded, so every access has to be guarded.
  private availableTracks(): SubtitleTrack[] {
    return this.player?.subtitles?.list() ?? [];
  }

  private enabledTracks(): SubtitleTrack[] {
    return this.availableTracks().filter(track => track.enabled);
  }

  private trackToEnable(): SubtitleTrack | undefined {
    const tracks = this.availableTracks();
    const audioLanguage = this.player?.getAudio()?.lang;

    return (
      tracks.find(track => track.id === this.lastEnabledTrackId) ??
      tracks.find(track => track.lang === audioLanguage) ??
      tracks[0]
    );
  }

  private updateState(): void {
    if (this.availableTracks().length === 0) {
      this.hide();
      return;
    }

    this.show();
    this.enabledTracks().length > 0 ? this.on() : this.off();
  }

  private onPlayerStateChanged = (): void => {
    this.updateState();
  };

  private onSubtitleEnabled = (event: SubtitleEvent): void => {
    if (event.subtitle) {
      this.lastEnabledTrackId = event.subtitle.id;
    }
    this.updateState();
  };

  private onSourceUnloaded = (): void => {
    // The restored track belongs to the previous source, so it must not leak into the next one.
    this.lastEnabledTrackId = undefined;
    this.updateState();
  };

  release(): void {
    super.release();

    if (this.player) {
      this.player.off(this.player.exports.PlayerEvent.SourceLoaded, this.onPlayerStateChanged);
      this.player.off(this.player.exports.PlayerEvent.SourceUnloaded, this.onSourceUnloaded);
      this.player.off(this.player.exports.PlayerEvent.SubtitleAdded, this.onPlayerStateChanged);
      this.player.off(this.player.exports.PlayerEvent.SubtitleRemoved, this.onPlayerStateChanged);
      this.player.off(this.player.exports.PlayerEvent.SubtitleEnabled, this.onSubtitleEnabled);
      this.player.off(this.player.exports.PlayerEvent.SubtitleDisabled, this.onPlayerStateChanged);
      this.player.off(this.player.exports.PlayerEvent.PeriodSwitched, this.onPlayerStateChanged);
    }

    this.uimanager?.getConfig().events.onUpdated.unsubscribe(this.onPlayerStateChanged);

    this.lastEnabledTrackId = undefined;
    this.player = null;
    this.uimanager = null;
  }
}
