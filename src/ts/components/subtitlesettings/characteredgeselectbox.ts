import { SubtitleSettingSelectBox, SubtitleSettingSelectBoxConfig } from './subtitlesettingselectbox';
import {UIInstanceManager} from '../../uimanager';
import { PlayerAPI } from 'bitmovin-player';

/**
 * A select box providing a selection of different character edge.
 */
export class CharacterEdgeSelectBox extends SubtitleSettingSelectBox {

  constructor(config: SubtitleSettingSelectBoxConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClasses: ['ui-subtitlesettingscharacteredgeselectbox'],
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.addItem(null, 'default');
    this.addItem('raised', 'raised');
    this.addItem('depressed', 'depressed');
    this.addItem('uniform', 'uniform');
    this.addItem('dropshadowed', 'drop shadowed');

    this.settingsManager.characterEdge.onChanged.subscribe((sender, property) => {
      if (property.isSet()) {
        this.toggleOverlayClass('characteredge-' + property.value);
      } else {
        this.toggleOverlayClass(null);
      }

      // Select the item in case the property was set from outside
      this.selectItem(property.value);
    });

    this.onItemSelected.subscribe((sender, key: string) => {
      this.settingsManager.characterEdge.value = key;
    });

    // Load initial value
    if (this.settingsManager.characterEdge.isSet()) {
      this.selectItem(this.settingsManager.characterEdge.value);
    }
  }
}
