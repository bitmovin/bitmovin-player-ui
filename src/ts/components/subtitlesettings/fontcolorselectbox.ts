import { SubtitleSettingSelectBox, SubtitleSettingSelectBoxConfig } from './subtitlesettingselectbox';
import {UIInstanceManager} from '../../uimanager';
import { PlayerAPI } from 'bitmovin-player';

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
