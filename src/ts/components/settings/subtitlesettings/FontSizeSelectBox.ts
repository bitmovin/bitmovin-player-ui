import { SubtitleSettingSelectBox, SubtitleSettingSelectBoxConfig } from './SubtitleSettingSelectBox';
import { UIInstanceManager } from '../../../UIManager';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../../../localization/i18n';
import { ListItem } from '../../lists/ListSelector';

/**
 * A select box providing a selection of different font sizes.
 *
 * @category Components
 */
export class FontSizeSelectBox extends SubtitleSettingSelectBox {
  constructor(config: SubtitleSettingSelectBoxConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClasses: ['ui-subtitlesettingsfontsizeselectbox'],
    }, this.config);
  }

  private getFontSizeOptions(): ListItem[] {
    return [
      { key: null, label: i18n.getLocalizer('default') },
      { key: '50', label: i18n.getLocalizer('percent', { value: 50 }) },
      { key: '75', label: i18n.getLocalizer('percent', { value: 75 }) },
      { key: '100', label: i18n.getLocalizer('percent', { value: 100 }) },
      { key: '150', label: i18n.getLocalizer('percent', { value: 150 }) },
      { key: '200', label: i18n.getLocalizer('percent', { value: 200 }) },
      { key: '300', label: i18n.getLocalizer('percent', { value: 300 }) },
      { key: '400', label: i18n.getLocalizer('percent', { value: 400 }) },
    ];
  }

  private populateItemsWithFilter(): void {
    this.clearItems();

    for (const item of this.getFontSizeOptions()) {
      if (!this.config.filter || this.config.filter(item)) {
        this.addItem(item.key, item.label);
      }
    }

    if (this.settingsManager.fontSize.isSet()) {
      this.selectItem(this.settingsManager.fontSize.value);
    }
  }

  public reapplyFilterAndReload(): void {
    this.populateItemsWithFilter();
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.populateItemsWithFilter();

    this.onShow.subscribe(() => {
      this.populateItemsWithFilter();
    });

    this.settingsManager.fontSize.onChanged.subscribe((sender, property) => {
      if (property.isSet()) {
        this.toggleOverlayClass('fontsize-' + property.value);
      } else {
        this.toggleOverlayClass(null);
      }

      this.selectItem(property.value);
    });

    this.onItemSelected.subscribe((sender, key: string) => {
      this.settingsManager.fontSize.value = key;
    });
  }
}
