import {SettingsPanel, SettingsPanelConfig} from './settingspanel';
import {SubtitleOverlay} from './subtitleoverlay';
import {UIInstanceManager} from '../uimanager';
import GetSubtitleSettingList from './subtitlesettings/settinglist';

export interface SubtitleSettingsPanelConfig extends SettingsPanelConfig {
  overlay: SubtitleOverlay,
}

export class SubtitleSettingsPanel extends SettingsPanel {
  constructor(config: SubtitleSettingsPanelConfig) {
    super(config)

    this.config = this.mergeConfig<SettingsPanelConfig>(config, {
      components: GetSubtitleSettingList(config.overlay)
    }, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);
  }
}
