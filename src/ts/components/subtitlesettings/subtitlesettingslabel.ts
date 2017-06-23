import {Label, LabelConfig} from './../label';
import {Container, ContainerConfig} from './../container';
import {SubtitleSettingsOpenButton} from './subtitlesettingsopenbutton';
import {DOM} from './../../dom';

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
