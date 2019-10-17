import { SubtitleSettingSelectBox, SubtitleSettingSelectBoxConfig } from './subtitlesettingselectbox';
import {UIInstanceManager} from '../../uimanager';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../../localization/i18n';

/**
 * A select box providing a selection of different font colors.
 */
export class FontSizeSelectBox extends SubtitleSettingSelectBox {

  constructor(config: SubtitleSettingSelectBoxConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClasses: ['ui-subtitlesettingsfontsizeselectbox'],
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.addItem(null, i18n.getLocalizer('default'));
    this.addItem('50', i18n.getLocalizer('percent', { value: 50 }));
    this.addItem('75', i18n.getLocalizer('percent', { value: 75 }));
    this.addItem('100', i18n.getLocalizer('percent', { value: 100 }));
    this.addItem('150', i18n.getLocalizer('percent', { value: 150 }));
    this.addItem('200', i18n.getLocalizer('percent', { value: 200 }));
    this.addItem('300', i18n.getLocalizer('percent', { value: 300 }));
    this.addItem('400', i18n.getLocalizer('percent', { value: 400 }));

    this.settingsManager.fontSize.onChanged.subscribe((sender, property) => {
      if (property.isSet()) {
        this.toggleOverlayClass('fontsize-' + property.value);
      } else {
        this.toggleOverlayClass(null);
      }

      // Select the item in case the property was set from outside
      this.selectItem(property.value);
    });

    this.onItemSelected.subscribe((sender, key: string) => {
      this.settingsManager.fontSize.value = key;
    });

    // Load initial value
    if (this.settingsManager.fontSize.isSet()) {
      this.selectItem(this.settingsManager.fontSize.value);
    }
  }
}
