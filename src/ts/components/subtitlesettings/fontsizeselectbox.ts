import {SubtitleSettingSelectBox} from './subtitlesettingselectbox';
import {UIInstanceManager} from '../../uimanager';

/**
 * A select box providing a selection of different font colors.
 */
export class FontSizeSelectBox extends SubtitleSettingSelectBox {

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.addItem(null, 'default');
    this.addItem('50', '50%');
    this.addItem('75', '75%');
    this.addItem('100', '100%');
    this.addItem('150', '150%');
    this.addItem('200', '200%');
    this.addItem('300', '300%');
    this.addItem('400', '400%');

    this.settingsManager.fontSize.onChanged.subscribe((sender, property) => {
      if (property.isSet()) {
        this.toggleOverlayClass('fontsize-' + property.value);
      } else {
        this.toggleOverlayClass(null);
      }

      // Select the item in case the property was set from outside
      this.selectItem(property.value);
    });

    this.onItemSelected.subscribe((sender, key: string) => {
      this.settingsManager.fontSize.value = key;
    });

    // Load initial value
    if (this.settingsManager.fontSize.isSet()) {
      this.selectItem(this.settingsManager.fontSize.value);
    }
  }
}
