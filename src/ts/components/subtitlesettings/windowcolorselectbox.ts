import { SubtitleSettingSelectBox, SubtitleSettingSelectBoxConfig } from './subtitlesettingselectbox';
import {UIInstanceManager} from '../../uimanager';
import { PlayerAPI } from 'bitmovin-player';

/**
 * A select box providing a selection of different background colors.
 */
export class WindowColorSelectBox extends SubtitleSettingSelectBox {

  constructor(config: SubtitleSettingSelectBoxConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClasses: ['ui-window-color-selectbox'],
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.addItem(null, 'default');
    this.addItem('white', 'white');
    this.addItem('black', 'black');
    this.addItem('red', 'red');
    this.addItem('green', 'green');
    this.addItem('blue', 'blue');
    this.addItem('cyan', 'cyan');
    this.addItem('yellow', 'yellow');
    this.addItem('magenta', 'magenta');

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
