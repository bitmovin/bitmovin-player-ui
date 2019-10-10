import { SubtitleSettingSelectBox, SubtitleSettingSelectBoxConfig } from './subtitlesettingselectbox';
import {UIInstanceManager} from '../../uimanager';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../../localization/i18n';

/**
 * A select box providing a selection of different font colors.
 */
export class FontColorSelectBox extends SubtitleSettingSelectBox {

  constructor(config: SubtitleSettingSelectBoxConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClasses: ['ui-subtitlesettingsfontcolorselectbox'],
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.addItem(null, i18n.t('labels.default'));
    this.addItem('white', i18n.t('colors.white'));
    this.addItem('black', i18n.t('colors.black'));
    this.addItem('red', i18n.t('colors.red'));
    this.addItem('green', i18n.t('colors.green'));
    this.addItem('blue', i18n.t('colors.blue'));
    this.addItem('cyan', i18n.t('colors.cyan'));
    this.addItem('yellow', i18n.t('colors.yellow'));
    this.addItem('magenta', i18n.t('colors.magenta'));

    let setColorAndOpacity = () => {
      if (this.settingsManager.fontColor.isSet() && this.settingsManager.fontOpacity.isSet()) {
        this.toggleOverlayClass(
          'fontcolor-' + this.settingsManager.fontColor.value + this.settingsManager.fontOpacity.value);
      } else {
        this.toggleOverlayClass(null);
      }
    };

    this.onItemSelected.subscribe((sender, key: string) => {
      this.settingsManager.fontColor.value = key;
    });

    this.settingsManager.fontColor.onChanged.subscribe((sender, property) => {
      // Color and opacity go together, so we need to...
      if (!this.settingsManager.fontColor.isSet()) {
        // ... clear the opacity when the color is not set
        this.settingsManager.fontOpacity.clear();
      } else if (!this.settingsManager.fontOpacity.isSet()) {
        // ... set an opacity when the color is set
        this.settingsManager.fontOpacity.value = '100';
      }
      this.selectItem(property.value);
      setColorAndOpacity();
    });

    this.settingsManager.fontOpacity.onChanged.subscribe(() => {
      setColorAndOpacity();
    });

    // Load initial value
    if (this.settingsManager.fontColor.isSet()) {
      this.selectItem(this.settingsManager.fontColor.value);
    }
  }
}
