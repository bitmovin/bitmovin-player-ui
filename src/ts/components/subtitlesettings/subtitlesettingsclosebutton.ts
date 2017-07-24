import {SubtitleSettingsButton} from './subtitlesettingsbutton';
import {SubtitleSettingsButtonConfig} from './subtitlesettingsbutton';
import {UIInstanceManager} from '../../uimanager';
import {DOM} from '../../dom';

/**
 * A button that toggles the option menu for subtitles
 */
export class SubtitleSettingsCloseButton extends SubtitleSettingsButton {

  constructor(config: SubtitleSettingsButtonConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-subtitlesettingsclosebutton',
      text: 'Back',
    }, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.onClick.subscribe(() => {
      this.subtitleSettingsPanel.hide();
      this.settingsPanel.show();
    });
  }
}
