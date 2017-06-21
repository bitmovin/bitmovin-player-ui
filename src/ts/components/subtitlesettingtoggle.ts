import {ToggleButton, ToggleButtonConfig} from './togglebutton';
import {Button, ButtonConfig} from './button';
import {Container, ContainerConfig} from './container';
import {Label, LabelConfig} from './label';
import {SubtitleSettingsPanel} from './subtitlesettingspanel';
import {UIInstanceManager} from '../uimanager';
import {DOM} from '../dom';
import {EventDispatcher, Event, NoArgs} from '../eventdispatcher';

export interface SubtitleSettingsButtonConfig extends ButtonConfig {
  subtitleSettingsPanel: SubtitleSettingsPanel
}

/**
 * A button that toggles the option menu for subtitles
 */
export class SubtitleSettingsOpener extends Button<ButtonConfig> {

  constructor(config: SubtitleSettingsButtonConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-subtitlesettingtoggle',
      text: 'Subtitles settings',
    }, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = <SubtitleSettingsButtonConfig>this.getConfig();

    this.onClick.subscribe(() => {
      config.subtitleSettingsPanel.show();
    });

    let checkVisibility = () => {
      // Only display the menu panel if subtitles are present
      if (player.getAvailableSubtitles().length === 1) {
        this.hide();
      } else {
        this.show();
      }
    }

    // If the source change, we might not have subtitles and won't need the option
    player.addEventHandler(player.EVENT.ON_SUBTITLE_ADDED, checkVisibility);
    player.addEventHandler(player.EVENT.ON_SUBTITLE_CHANGED, checkVisibility);
    player.addEventHandler(player.EVENT.ON_SUBTITLE_REMOVED, checkVisibility);
    player.addEventHandler(player.EVENT.ON_SOURCE_UNLOADED, checkVisibility);
    player.addEventHandler(player.EVENT.ON_READY, checkVisibility);

    checkVisibility()
  }
}

export interface SubtitleSettingLabelConfig extends LabelConfig {
  opener: SubtitleSettingsOpener;
}

export class SubtitleSettingLabel extends Container<ContainerConfig> {

  private opener: SubtitleSettingsOpener;

  private text: string;

  constructor(config: SubtitleSettingLabelConfig) {
    super(config)

    this.opener = config.opener;
    this.text = config.text;

    this.config = this.mergeConfig(<ContainerConfig>config, {
      cssClass: 'ui-label',
      components: [
        this.opener
      ],
    }, this.config);
  }

  protected toDomElement(): DOM {
    let labelElement = new DOM('span', {
      'id': this.config.id,
      'class': this.getCssClasses()
    }).append(
      new DOM('span', {}).html(this.text),
      this.opener.getDomElement() ,
    );

    return labelElement;
  }
}

/**
 * A button that toggles the option menu for subtitles
 */
export class SubtitlePanelCloser extends Button<ButtonConfig> {

  private panel: SubtitleSettingsPanel;

  constructor(config: SubtitleSettingsButtonConfig) {
    super(config);

    this.panel = config.subtitleSettingsPanel;
    this.config = this.mergeConfig(config, {
      cssClass: 'ui-subtitleoptioncloser',
      text: 'Back',
    }, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.onClick.subscribe(() => {
      this.panel.hide();
    });
  }

  protected toDomElement(): DOM {
    // Create the button element with the text label
    let buttonElement = new DOM('button', {
      'type': 'button',
      'id': this.config.id,
      'class': this.getCssClasses()
    }).append(new DOM('span', {}).html(this.config.text));

    // Listen for the click event on the button element and trigger the corresponding event on the button component
    buttonElement.on('click', () => {
      this.onClickEvent();
    });

    return buttonElement;
  }

  addSubtileSettingsPanel(panel: SubtitleSettingsPanel) {
    this.panel = panel;
  }
}
