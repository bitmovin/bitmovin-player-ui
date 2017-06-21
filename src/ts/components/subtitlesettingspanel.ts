import {SettingsPanel, SettingsPanelConfig} from './settingspanel';
import {SubtitleOverlay} from './subtitleoverlay';
import {UIInstanceManager} from '../uimanager';
import GetSubtitleSettingList from './subtitlesettings/settinglist';

export class SubtitleSettingsPanel extends SettingsPanel {
  constructor(config: SettingsPanelConfig) {
    super(config)
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);
  }
}
