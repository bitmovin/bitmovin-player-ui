import {LabelConfig} from '../label';
import {Container, ContainerConfig} from '../container';
import {DOM} from '../../dom';
import {SettingsPanelPageOpenButton} from '../settingspanelpageopenbutton';

export interface SubtitleSettingsLabelConfig extends LabelConfig {
  opener: SettingsPanelPageOpenButton;
}

export class SubtitleSettingsLabel extends Container<ContainerConfig> {

  private opener: SettingsPanelPageOpenButton;

  private text: string;

  constructor(config: SubtitleSettingsLabelConfig) {
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
      this.opener.getDomElement(),
    );

    return labelElement;
  }
}
