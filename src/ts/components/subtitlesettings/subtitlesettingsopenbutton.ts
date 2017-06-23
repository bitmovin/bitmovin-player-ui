import {Button, ButtonConfig} from '../button';
import {SettingsPanel} from '../settingspanel';
import {SubtitleSettingsPanel} from '../subtitlesettingspanel';
import {SubtitleSettingsButtonConfig} from '../subtitlesettingtoggle';
import {UIInstanceManager} from '../../uimanager';

/**
 * A button that toggles the option menu for subtitles
 */
export class SubtitleSettingsOpenButton extends Button<ButtonConfig> {

  private subtitleSettingsPanel: SubtitleSettingsPanel;
  private settingsPanel: SettingsPanel;

  constructor(config: SubtitleSettingsButtonConfig) {
    super(config);

    this.subtitleSettingsPanel = config.subtitleSettingsPanel;
    this.settingsPanel = config.settingsPanel;

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-subtitlesettingtoggle',
      text: 'Subtitles settings',
    }, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.onClick.subscribe(() => {
      this.subtitleSettingsPanel.show();
      this.settingsPanel.hide();
    });
  }
}

