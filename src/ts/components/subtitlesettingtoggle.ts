import {ToggleButton, ToggleButtonConfig} from './togglebutton';
import {Button, ButtonConfig} from './button';
import {Container, ContainerConfig} from './container';
import {Label, LabelConfig} from './label';
import {SettingsPanel} from './settingspanel';
import {SubtitleSettingsPanel} from './subtitlesettingspanel';
import {UIInstanceManager} from '../uimanager';
import {DOM} from '../dom';
import {EventDispatcher, Event, NoArgs} from '../eventdispatcher';
import {SubtitleSettingsOpenButton} from './subtitlesettings/subtitlesettingsopenbutton';

export interface SubtitleSettingsButtonConfig extends ButtonConfig {
  subtitleSettingsPanel: SubtitleSettingsPanel;
  settingsPanel: SettingsPanel;
}

export interface SubtitleSettingLabelConfig extends LabelConfig {
  opener: SubtitleSettingsOpenButton;
}

export class SubtitleSettingLabel extends Container<ContainerConfig> {

  private opener: SubtitleSettingsOpenButton;

  private text: string;

  constructor(config: SubtitleSettingLabelConfig) {
    super(config);

    this.opener = config.opener;
    this.text = config.text;

    this.config = this.mergeConfig(<ContainerConfig>config, {
      cssClass: 'ui-label',
      components: [
        this.opener,
      ],
    }, this.config);
  }

  protected toDomElement(): DOM {
    let labelElement = new DOM('span', {
      'id': this.config.id,
      'class': this.getCssClasses(),
    }).append(
      new DOM('span', {}).html(this.text),
      this.opener.getDomElement()
    );

    return labelElement;
  }
}

/**
 * A button that toggles the option menu for subtitles
 */
export class SubtitlePanelCloser extends Button<ButtonConfig> {

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
