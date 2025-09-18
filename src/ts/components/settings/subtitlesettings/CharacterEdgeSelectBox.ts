import { SubtitleSettingSelectBox, SubtitleSettingSelectBoxConfig } from './SubtitleSettingSelectBox';
import {UIInstanceManager} from '../../../UIManager';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../../../localization/i18n';

/**
 * A select box providing a selection of different character edge.
 *
 * @category Components
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

    this.addItem(null, i18n.getLocalizer('default'));
    this.addItem('raised', i18n.getLocalizer('settings.subtitles.characterEdge.raised'));
    this.addItem('depressed', i18n.getLocalizer('settings.subtitles.characterEdge.depressed'));
    this.addItem('uniform', i18n.getLocalizer('settings.subtitles.characterEdge.uniform'));
    this.addItem('dropshadowed', i18n.getLocalizer('settings.subtitles.characterEdge.dropshadowed'));

    const setColorAndEdgeType = () => {
      if (this.settingsManager.characterEdge.isSet() && this.settingsManager.characterEdgeColor.isSet()) {
        this.toggleOverlayClass('characteredge-' + this.settingsManager.characterEdge.value + '-' + this.settingsManager.characterEdgeColor.value);
      } else {
        this.toggleOverlayClass(null);
      }
    }

    this.onItemSelected.subscribe((sender, key: string) => {
      this.settingsManager.characterEdge.value = key;
    });
    
    this.settingsManager.characterEdge.onChanged.subscribe((sender, property) => {
      // Edge type and color go together, so we need to...
      if (!this.settingsManager.characterEdge.isSet()) {
        // ... clear the color when the edge type is not set
        this.settingsManager.characterEdgeColor.clear();
      } else if (!this.settingsManager.characterEdgeColor.isSet()) {
        // ... set a color when the edge type is set
        this.settingsManager.characterEdgeColor.value = 'black';
      }
      this.selectItem(property.value);
      setColorAndEdgeType();
    });

    this.settingsManager.characterEdgeColor.onChanged.subscribe(() => {
      setColorAndEdgeType();
    });    

    // Load initial value
    if (this.settingsManager.characterEdge.isSet()) {
      this.selectItem(this.settingsManager.characterEdge.value);
    }
  }
}
