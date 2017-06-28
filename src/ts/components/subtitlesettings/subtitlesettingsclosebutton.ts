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
