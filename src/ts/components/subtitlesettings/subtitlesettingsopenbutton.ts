import {SubtitleSettingsButton} from './subtitlesettingsbutton';


import {SubtitleSettingsButtonConfig} from './subtitlesettingsbutton';
import {UIInstanceManager} from '../../uimanager';

/**
 * A button that toggles the option menu for subtitles
 */
export class SubtitleSettingsOpenButton extends SubtitleSettingsButton {

  constructor(config: SubtitleSettingsButtonConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-subtitlesettingsopenbutton',
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

