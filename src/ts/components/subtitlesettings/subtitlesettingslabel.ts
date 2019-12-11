import {LabelConfig} from '../label';
import {Container, ContainerConfig} from '../container';
import {DOM} from '../../dom';
import {SettingsPanelPageOpenButton} from '../settingspanelpageopenbutton';
import { LocalizableText, i18n } from '../../localization/i18n';

export interface SubtitleSettingsLabelConfig extends LabelConfig {
  opener: SettingsPanelPageOpenButton;
}

export class SubtitleSettingsLabel extends Container<ContainerConfig> {

  private opener: SettingsPanelPageOpenButton;

  private text: LocalizableText;

  private for: string;

  constructor(config: SubtitleSettingsLabelConfig) {
    super(config);

    this.opener = config.opener;
    this.text = config.text;
    this.for = config.for;

    this.config = this.mergeConfig(<ContainerConfig>config, {
      cssClass: 'ui-label',
      components: [
        this.opener,
      ],
    }, this.config);
  }

  protected toDomElement(): DOM {
    let labelElement = new DOM('label', {
      'id': this.config.id,
      'class': this.getCssClasses(),
      'for': this.for,
    }).append(
      new DOM('span', {}).html(i18n.performLocalization(this.text)),
      this.opener.getDomElement(),
    );

    return labelElement;
  }
}
