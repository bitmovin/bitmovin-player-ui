import { SubtitleSettingSelectBox, SubtitleSettingSelectBoxConfig } from './subtitlesettingselectbox';
import {UIInstanceManager} from '../../uimanager';
import { PlayerAPI } from 'bitmovin-player';

/**
 * A select box providing a selection of different font colors.
 */
export class FontOpacitySelectBox extends SubtitleSettingSelectBox {

  constructor(config: SubtitleSettingSelectBoxConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClasses: ['ui-font-opacity-selectbox'],
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.addItem(null, 'default');
    this.addItem('100', '100%');
    this.addItem('75', '75%');
    this.addItem('50', '50%');
    this.addItem('25', '25%');

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
