import { SubtitleSettingSelectBox, SubtitleSettingSelectBoxConfig } from './subtitlesettingselectbox';
import {UIInstanceManager} from '../../uimanager';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../../localization/i18n';

/**
 * A select box providing a selection of different font colors.
 */
export class FontOpacitySelectBox extends SubtitleSettingSelectBox {

  constructor(config: SubtitleSettingSelectBoxConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClasses: ['ui-subtitlesettingsfontopacityselectbox'],
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.addItem(null, i18n.getLocalizer('default'));
    this.addItem('100', i18n.getLocalizer('percent', { value: 100 }));
    this.addItem('75', i18n.getLocalizer('percent', { value: 75 }));
    this.addItem('50', i18n.getLocalizer('percent', { value: 50 }));
    this.addItem('25', i18n.getLocalizer('percent', { value: 25 }));

    this.onItemSelected.subscribe((sender, key: string) => {
      this.settingsManager.fontOpacity.value = key;

      // Color and opacity go together, so we need to...
      if (!this.settingsManager.fontOpacity.isSet()) {
        // ... clear the color when the opacity is not set
        this.settingsManager.fontColor.clear();
      } else if (!this.settingsManager.fontColor.isSet()) {
        // ... set a color when the opacity is set
        this.settingsManager.fontColor.value = 'white';
      }
    });

    // Update selected item when value is set from somewhere else
    this.settingsManager.fontOpacity.onChanged.subscribe((sender, property) => {
      this.selectItem(property.value);
    });

    // Load initial value
    if (this.settingsManager.fontOpacity.isSet()) {
      this.selectItem(this.settingsManager.fontOpacity.value);
    }
  }
}
