import { PlayerAPI } from 'bitmovin-player';
import { SubtitleSettingSelectBox, SubtitleSettingSelectBoxConfig } from './SubtitleSettingSelectBox';
import { UIInstanceManager } from '../../../UIManager';
import { i18n } from '../../../localization/i18n';

/**
 * A select box providing a selection of different character edge colors.
 *
 * @category Components
 */
export class CharacterEdgeColorSelectBox extends SubtitleSettingSelectBox {
  constructor(config: SubtitleSettingSelectBoxConfig) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClasses: ['ui-subtitle-settings-character-edge-color-select-box'],
      },
      this.config,
    );
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

    this.onItemSelected.subscribe((sender, key: string) => {
      this.settingsManager.characterEdgeColor.value = key;

      // Edge type and color go together, so we need to...
      if (!this.settingsManager.characterEdgeColor.isSet()) {
        // ... clear the edge type when the color is not set
        this.settingsManager.characterEdge.clear();
      } else if (!this.settingsManager.characterEdge.isSet()) {
        // ... set a edge type when the color is set
        this.settingsManager.characterEdge.value = 'uniform';
      }
    });

    // Update selected item when value is set from somewhere else
    this.settingsManager.characterEdgeColor.onChanged.subscribe((sender, property) => {
      this.selectItem(property.value);
    });

    // Load initial value
    if (this.settingsManager.characterEdgeColor.isSet()) {
      this.selectItem(this.settingsManager.characterEdgeColor.value);
    }
  }
}
