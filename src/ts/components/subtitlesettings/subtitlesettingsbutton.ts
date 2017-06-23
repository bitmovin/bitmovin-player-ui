import {Button, ButtonConfig} from '../button';
import {SettingsPanel} from '../settingspanel';
import {SubtitleSettingsPanel} from '../subtitlesettingspanel';

export interface SubtitleSettingsButtonConfig extends ButtonConfig {
  subtitleSettingsPanel: SubtitleSettingsPanel;
  settingsPanel: SettingsPanel;
}

export class SubtitleSettingsButton extends Button<ButtonConfig> {

  protected subtitleSettingsPanel: SubtitleSettingsPanel;
  protected settingsPanel: SettingsPanel;

  constructor(config: SubtitleSettingsButtonConfig) {
    super(config);

    this.subtitleSettingsPanel = config.subtitleSettingsPanel;
    this.settingsPanel = config.settingsPanel;
  }
}
