import {Button, ButtonConfig} from '../button';
import {SettingsPanel} from '../settingspanel';
import {SubtitleSettingsPanel} from '../subtitlesettingspanel';
import {SubtitleSettingsButtonConfig} from '../subtitlesettingtoggle';
import {UIInstanceManager} from '../../uimanager';
import {DOM} from '../../dom';

/**
 * A button that toggles the option menu for subtitles
 */
export class SubtitleSettingsCloseButton extends Button<ButtonConfig> {

  private subtitleSettingsPanel: SubtitleSettingsPanel;
  private settingsPanel: SettingsPanel;

  constructor(config: SubtitleSettingsButtonConfig) {
    super(config);

    this.subtitleSettingsPanel = config.subtitleSettingsPanel;
    this.settingsPanel = config.settingsPanel;

    this.subtitleSettingsPanel = config.subtitleSettingsPanel;
    this.config = this.mergeConfig(config, {
      cssClass: 'ui-subtitleoptioncloser',
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

  protected toDomElement(): DOM {
    // Create the button element with the text label
    let buttonElement = new DOM('button', {
      'type': 'button',
      'id': this.config.id,
      'class': this.getCssClasses(),
    }).append(new DOM('span', {}).html(this.config.text));

    // Listen for the click event on the button element and trigger the corresponding event on the button component
    buttonElement.on('click', () => {
      this.onClickEvent();
    });

    return buttonElement;
  }
}
