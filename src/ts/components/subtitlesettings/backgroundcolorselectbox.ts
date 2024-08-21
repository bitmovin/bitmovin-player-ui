import { SubtitleSettingSelectBox, SubtitleSettingSelectBoxConfig } from './subtitlesettingselectbox';
import {UIInstanceManager} from '../../uimanager';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../../localization/i18n';

/**
 * A select box providing a selection of different background colors.
 *
 * @category Components
 */
export class BackgroundColorSelectBox extends SubtitleSettingSelectBox {

  constructor(config: SubtitleSettingSelectBoxConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClasses: ['ui-subtitlesettingsbackgroundcolorselectbox'],
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.addItem(null, i18n.getLocalizer('default'));
    this.addItem('white', i18n.getLocalizer('colors.white'));
    this.addItem('black', i18n.getLocalizer('colors.black'));
    this.addItem('red', i18n.getLocalizer('colors.red'));
    this.addItem('green', i18n.getLocalizer('colors.green'));
    this.addItem('blue', i18n.getLocalizer('colors.blue'));
    this.addItem('cyan', i18n.getLocalizer('colors.cyan'));
    this.addItem('yellow', i18n.getLocalizer('colors.yellow'));
    this.addItem('magenta', i18n.getLocalizer('colors.magenta'));

    let setColorAndOpacity = () => {
      if (this.settingsManager.backgroundColor.isSet() && this.settingsManager.backgroundOpacity.isSet()) {
        this.toggleOverlayClass(
          'bgcolor-' + this.settingsManager.backgroundColor.value + this.settingsManager.backgroundOpacity.value);
      } else {
        this.toggleOverlayClass(null);
      }
    };

    this.onItemSelected.subscribe((sender, key: string) => {
      this.settingsManager.backgroundColor.value = key;
    });

    this.settingsManager.backgroundColor.onChanged.subscribe((sender, property) => {
      // Color and opacity go together, so we need to...
      if (!this.settingsManager.backgroundColor.isSet()) {
        // ... clear the opacity when the color is not set
        this.settingsManager.backgroundOpacity.clear();
      } else if (!this.settingsManager.backgroundOpacity.isSet()) {
        // ... set an opacity when the color is set
        this.settingsManager.backgroundOpacity.value = '100';
      }
      this.selectItem(property.value);
      setColorAndOpacity();
    });

    this.settingsManager.backgroundOpacity.onChanged.subscribe(() => {
      setColorAndOpacity();
    });

    // Load initial value
    if (this.settingsManager.backgroundColor.isSet()) {
      this.selectItem(this.settingsManager.backgroundColor.value);
    }
  }
}
