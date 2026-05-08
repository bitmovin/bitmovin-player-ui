import { Container, ContainerConfig } from '../Container';
import { DOM } from '../../DOM';
import { UIInstanceManager } from '../../UIManager';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../../localization/i18n';
import { ResumeStorage } from '../../utils/ResumeStorage';
import { StringUtils } from '../../utils/StringUtils';

/**
 * Configuration interface for the {@link ResumeOverlay}.
 *
 * @category Configs
 */
export interface ResumeOverlayConfig extends ContainerConfig {
  /**
   * How often (in milliseconds) the current playback position is written to storage while
   * playing. Lower values capture progress more accurately at the cost of more storage
   * writes; higher values are easier on slow set-top boxes / TVs.
   * Default: 5000
   */
  saveIntervalMs?: number;
}

/**
 * A small overlay that appears when a saved playback position is available for the
 * currently loaded source, offering the user the choice to resume from where they left
 * off or start over from the beginning.
 *
 * The overlay auto-dismisses on first user interaction (play, seek) so it doesn't sit on
 * top of the video forever. It is hidden by default and only shows when there's an entry
 * to resume.
 *
 * Resume tracking is gated by a stable source identifier (title, manifest URL). Sources
 * without any identifying metadata are not tracked.
 *
 * @category Components
 */
export class ResumeOverlay extends Container<ResumeOverlayConfig> {
  private resumeButton: DOM;
  private startOverButton: DOM;
  private label: DOM;

  private saveTimer: number | null = null;
  private storageKey: string | null = null;

  constructor(config: ResumeOverlayConfig = {}) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-resume-overlay',
        hidden: true,
        saveIntervalMs: 5000,
      } as ResumeOverlayConfig,
      this.config,
    );
  }

  protected toDomElement(): DOM {
    const element = super.toDomElement();

    this.label = new DOM('div', {
      class: this.prefixCss('ui-resume-overlay-label'),
    });

    this.resumeButton = new DOM('button', {
      type: 'button',
      class: this.prefixCss('ui-resume-overlay-resume'),
    }).html(i18n.performLocalization(i18n.getLocalizer('resume.continue')));

    this.startOverButton = new DOM('button', {
      type: 'button',
      class: this.prefixCss('ui-resume-overlay-start-over'),
    }).html(i18n.performLocalization(i18n.getLocalizer('resume.startOver')));

    const buttons = new DOM('div', {
      class: this.prefixCss('ui-resume-overlay-buttons'),
    });
    buttons.append(this.resumeButton);
    buttons.append(this.startOverButton);

    element.append(this.label);
    element.append(buttons);

    return element;
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    const uiConfig = uimanager.getConfig();

    const refreshKey = () => {
      this.storageKey = ResumeStorage.keyFor(player, uiConfig);
    };

    const stopSaveTimer = () => {
      if (this.saveTimer !== null) {
        window.clearInterval(this.saveTimer);
        this.saveTimer = null;
      }
    };

    const saveCurrentPosition = () => {
      if (!this.storageKey) return;
      const t = player.getCurrentTime();
      const d = player.getDuration();
      ResumeStorage.write(this.storageKey, t, d);
    };

    const startSaveTimer = () => {
      stopSaveTimer();
      if (!this.storageKey) return;
      this.saveTimer = window.setInterval(saveCurrentPosition, this.config.saveIntervalMs);
    };

    const offerResume = () => {
      if (!this.storageKey) {
        this.hide();
        return;
      }
      const entry = ResumeStorage.read(this.storageKey);
      if (!entry || player.isLive()) {
        this.hide();
        return;
      }
      this.label.html(
        i18n.performLocalization(i18n.getLocalizer('resume.prompt')) + ' ' + StringUtils.secondsToTime(entry.t),
      );
      this.show();
    };

    player.on(player.exports.PlayerEvent.SourceLoaded, () => {
      refreshKey();
      offerResume();
    });
    player.on(player.exports.PlayerEvent.SourceUnloaded, () => {
      saveCurrentPosition();
      stopSaveTimer();
      this.storageKey = null;
      this.hide();
    });
    player.on(player.exports.PlayerEvent.Play, () => {
      this.hide();
      startSaveTimer();
    });
    player.on(player.exports.PlayerEvent.Playing, startSaveTimer);
    player.on(player.exports.PlayerEvent.Paused, () => {
      saveCurrentPosition();
    });
    player.on(player.exports.PlayerEvent.Seeked, () => {
      this.hide();
    });
    player.on(player.exports.PlayerEvent.PlaybackFinished, () => {
      stopSaveTimer();
      if (this.storageKey) ResumeStorage.clear(this.storageKey);
    });
    player.on(player.exports.PlayerEvent.Destroy, stopSaveTimer);

    window.addEventListener('beforeunload', saveCurrentPosition);

    this.resumeButton.on('click', () => {
      if (!this.storageKey) {
        this.hide();
        return;
      }
      const entry = ResumeStorage.read(this.storageKey);
      if (entry) {
        try {
          player.seek(entry.t);
        } catch {
          // Seek can fail before the source is fully ready; nothing useful to do.
        }
      }
      this.hide();
    });

    this.startOverButton.on('click', () => {
      if (this.storageKey) ResumeStorage.clear(this.storageKey);
      try {
        player.seek(0);
      } catch {
        // best-effort
      }
      this.hide();
    });

    // If the player already has a source loaded by the time we configure (e.g. UI rebuild
    // on variant switch), evaluate immediately.
    if (player.getSource() != null) {
      refreshKey();
      offerResume();
    }
  }
}
