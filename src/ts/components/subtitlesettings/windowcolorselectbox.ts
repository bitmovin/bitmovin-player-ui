import { SubtitleSettingSelectBox, SubtitleSettingSelectBoxConfig } from './subtitlesettingselectbox';
import {UIInstanceManager} from '../../uimanager';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../../localization/i18n';

/**
 * A select box providing a selection of different background colors.
 *
 * @category Components
 */
export class WindowColorSelectBox extends SubtitleSettingSelectBox {

  constructor(config: SubtitleSettingSelectBoxConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClasses: ['ui-subtitlesettingswindowcolorselectbox'],
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
      if (this.settingsManager.windowColor.isSet() && this.settingsManager.windowOpacity.isSet()) {
        this.toggleOverlayClass(
          'windowcolor-' + this.settingsManager.windowColor.value + this.settingsManager.windowOpacity.value);
      } else {
        this.toggleOverlayClass(null);
      }
    };

    this.onItemSelected.subscribe((sender, key: string) => {
      this.settingsManager.windowColor.value = key;
    });

    this.settingsManager.windowColor.onChanged.subscribe((sender, property) => {
      // Color and opacity go together, so we need to...
      if (!this.settingsManager.windowColor.isSet()) {
        // ... clear the opacity when the color is not set
        this.settingsManager.windowOpacity.clear();
      } else if (!this.settingsManager.windowOpacity.isSet()) {
        // ... set an opacity when the color is set
        this.settingsManager.windowOpacity.value = '100';
      }
      this.selectItem(property.value);
      setColorAndOpacity();
    });

    this.settingsManager.windowOpacity.onChanged.subscribe(() => {
      setColorAndOpacity();
    });

    // Load initial value
    if (this.settingsManager.windowColor.isSet()) {
      this.selectItem(this.settingsManager.windowColor.value);
    }
  }
}
