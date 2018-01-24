import {SubtitleSettingsButton} from './subtitlesettingsbutton';
import {SubtitleSettingsButtonConfig} from './subtitlesettingsbutton';
import {UIInstanceManager} from '../../uimanager';
import i18n from '../../i18n';

/**
 * A button that toggles the option menu for subtitles
 */
export class SubtitleSettingsCloseButton extends SubtitleSettingsButton {

  constructor(config: SubtitleSettingsButtonConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-subtitlesettingsclosebutton',
      text: i18n.q.labels.back,
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
