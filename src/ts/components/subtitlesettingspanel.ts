import {SettingsPanel, SettingsPanelConfig} from './settingspanel';
import {SubtitlePanelCloser} from './subtitlesettingtoggle'
import {SubtitleOverlay} from './subtitleoverlay';
import {UIInstanceManager} from '../uimanager';
import GetSubtitleSettingList from './subtitlesettings/settinglist';

export class SubtitleSettingsPanel extends SettingsPanel {
  constructor(config: SettingsPanelConfig) {
    super(config)
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    for (let component of this.getItems()) {
      if (component instanceof SubtitlePanelCloser) {
        component.addSubtileSettingsPanel(this);
      }
    }
  }
}
