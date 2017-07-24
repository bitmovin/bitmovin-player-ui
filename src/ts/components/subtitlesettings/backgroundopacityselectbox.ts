import {SubtitleSettingSelectBox} from './subtitlesettingselectbox';
import {UIInstanceManager} from '../../uimanager';

/**
 * A select box providing a selection of different background opacity.
 */
export class BackgroundOpacitySelectBox extends SubtitleSettingSelectBox {

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.addItem(null, 'default');
    this.addItem('100', '100%');
    this.addItem('75', '75%');
    this.addItem('50', '50%');
    this.addItem('25', '25%');
    this.addItem('0', '0%');

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
