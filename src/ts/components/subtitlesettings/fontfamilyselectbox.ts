import { SubtitleSettingSelectBox, SubtitleSettingSelectBoxConfig } from './subtitlesettingselectbox';
import {UIInstanceManager} from '../../uimanager';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../../localization/i18n';

/**
 * A select box providing a selection of different font family.
 */
export class FontFamilySelectBox extends SubtitleSettingSelectBox {

  constructor(config: SubtitleSettingSelectBoxConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClasses: ['ui-subtitlesettingsfontfamilyselectbox'],
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.addItem(null, i18n.getLocalizableCallback('default'));
    this.addItem('monospacedserif', i18n.getLocalizableCallback('settings.subtitles.font.family.monospacedserif'));
    this.addItem('proportionalserif', i18n.getLocalizableCallback('settings.subtitles.font.family.proportionalserif'));
    this.addItem('monospacedsansserif', i18n.getLocalizableCallback('settings.subtitles.font.family.monospacedsansserif'));
    this.addItem('proportionalsansserif', i18n.getLocalizableCallback('settings.subtitles.font.family.proportionalserif'));
    this.addItem('casual', i18n.getLocalizableCallback('settings.subtitles.font.family.casual'));
    this.addItem('cursive', i18n.getLocalizableCallback('settings.subtitles.font.family.cursive'));
    this.addItem('smallcapital', i18n.getLocalizableCallback('settings.subtitles.font.family.smallcapital'));

    this.settingsManager.fontFamily.onChanged.subscribe((sender, property) => {
      if (property.isSet()) {
        this.toggleOverlayClass('fontfamily-' + property.value);
      } else {
        this.toggleOverlayClass(null);
      }

      // Select the item in case the property was set from outside
      this.selectItem(property.value);
    });

    this.onItemSelected.subscribe((sender, key: string) => {
      this.settingsManager.fontFamily.value = key;
    });

    // Load initial value
    if (this.settingsManager.fontFamily.isSet()) {
      this.selectItem(this.settingsManager.fontFamily.value);
    }
  }
}
