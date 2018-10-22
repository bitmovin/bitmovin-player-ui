import { SubtitleSettingSelectBox, SubtitleSettingSelectBoxConfig } from './subtitlesettingselectbox';
import {UIInstanceManager} from '../../uimanager';
import { PlayerAPI } from 'bitmovin-player';

/**
 * A select box providing a selection of different font family.
 */
export class FontFamilySelectBox extends SubtitleSettingSelectBox {

  constructor(config: SubtitleSettingSelectBoxConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClasses: ['ui-font-family-selectbox'],
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.addItem(null, 'default');
    this.addItem('monospacedserif', 'monospaced serif');
    this.addItem('proportionalserif', 'proportional serif');
    this.addItem('monospacedsansserif', 'monospaced sans serif');
    this.addItem('proportionalsansserif', 'proportional sans serif');
    this.addItem('casual', 'casual');
    this.addItem('cursive', 'cursive');
    this.addItem('smallcapital', 'small capital');

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
