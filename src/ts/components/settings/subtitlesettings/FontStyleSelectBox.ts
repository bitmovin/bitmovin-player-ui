import { PlayerAPI } from 'bitmovin-player';
import { SubtitleSettingSelectBox, SubtitleSettingSelectBoxConfig } from './SubtitleSettingSelectBox';
import { UIInstanceManager } from '../../../UIManager';
import { i18n } from '../../../localization/i18n';

/**
 * A select box providing a selection of different font styles.
 *
 * @category Components
 */
export class FontStyleSelectBox extends SubtitleSettingSelectBox {
  constructor(config: SubtitleSettingSelectBoxConfig) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClasses: ['ui-subtitle-settings-font-style-select-box'],
      },
      this.config,
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.addItem(null, i18n.getLocalizer('default'));
    this.addItem('italic', i18n.getLocalizer('settings.subtitles.font.style.italic'));
    this.addItem('bold', i18n.getLocalizer('settings.subtitles.font.style.bold'));

    this.settingsManager?.fontStyle.onChanged.subscribe((sender, property) => {
      if (property.isSet()) {
        this.toggleOverlayClass('fontstyle-' + property.value);
      } else {
        this.toggleOverlayClass(null);
      }

      // Select the item in case the property was set from outside
      this.selectItem(property.value);
    });

    this.onItemSelected.subscribe((sender, key: string) => {
      if (this.settingsManager) {
        this.settingsManager.fontStyle.value = key;
      }
    });

    // Load initial value
    if (this.settingsManager?.fontStyle.isSet()) {
      this.selectItem(this.settingsManager.fontStyle.value);
    }
  }
}
