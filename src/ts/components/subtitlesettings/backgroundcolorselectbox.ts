import {SubtitleSettingSelectBox} from './subtitlesettingselectbox';
import {UIInstanceManager} from '../../uimanager';
import { PlayerAPI } from 'bitmovin-player';

/**
 * A select box providing a selection of different background colors.
 */
export class BackgroundColorSelectBox extends SubtitleSettingSelectBox {

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
