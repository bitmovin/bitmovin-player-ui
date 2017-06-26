import {SettingsPanel, SettingsPanelConfig} from '../settingspanel';
import {SubtitleOverlay} from '../subtitleoverlay';
import {UIInstanceManager} from '../../uimanager';

export interface SubtitleSettingsPanelConfig extends SettingsPanelConfig {
  overlay: SubtitleOverlay;
}

/**
 * SubtitleSettingsPanel is a settings panel specific to subtitles settings
 **/
export class SubtitleSettingsPanel extends SettingsPanel {

  private overlay: SubtitleOverlay;

  constructor(config: SubtitleSettingsPanelConfig) {
    super(config);

    this.overlay = config.overlay;
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.onShow.subscribe(() => {
      this.overlay.enablePreviewSubtitleLabel();
    });

    this.onHide.subscribe(() => {
      this.overlay.removePreviewSubtitleLabel();
    });
  }
}
