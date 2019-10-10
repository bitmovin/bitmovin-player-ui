import { SubtitleSettingSelectBox, SubtitleSettingSelectBoxConfig } from './subtitlesettingselectbox';
import {UIInstanceManager} from '../../uimanager';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../../localization/i18n';

/**
 * A select box providing a selection of different background opacity.
 */
export class BackgroundOpacitySelectBox extends SubtitleSettingSelectBox {

  constructor(config: SubtitleSettingSelectBoxConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClasses: ['ui-subtitlesettingsbackgroundopacityselectbox'],
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.addItem(null, i18n.t('labels.default'));
    this.addItem('100', i18n.t('opacity.100'));
    this.addItem('75', i18n.t('opacity.75'));
    this.addItem('50', i18n.t('opacity.50'));
    this.addItem('25', i18n.t('opacity.25'));
    this.addItem('0', i18n.t('opacity.0'));

    this.onItemSelected.subscribe((sender, key: string) => {
      this.settingsManager.backgroundOpacity.value = key;

      // Color and opacity go together, so we need to...
      if (!this.settingsManager.backgroundOpacity.isSet()) {
        // ... clear the color when the opacity is not set
        this.settingsManager.backgroundColor.clear();
      } else if (!this.settingsManager.backgroundColor.isSet()) {
        // ... set a color when the opacity is set
        this.settingsManager.backgroundColor.value = 'black';
      }
    });

    // Update selected item when value is set from somewhere else
    this.settingsManager.backgroundOpacity.onChanged.subscribe((sender, property) => {
      this.selectItem(property.value);
    });

    // Load initial value
    if (this.settingsManager.backgroundOpacity.isSet()) {
      this.selectItem(this.settingsManager.backgroundOpacity.value);
    }
  }
}
