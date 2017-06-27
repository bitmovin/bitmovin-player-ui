import {SubtitleSettingSelectBoxConfig, SubtitleSettingSelectBox} from './subtitlesettingselectbox';
import {UIInstanceManager} from '../../uimanager';
import {StorageUtils} from '../../utils';

/**
 * A select box providing a selection of different font colors.
 */
export class FontSizeSelectBox extends SubtitleSettingSelectBox {

  constructor(config: SubtitleSettingSelectBoxConfig) {
    super(config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.addItem('0.5', '50%');
    this.addItem('0.75', '75%');
    this.addItem('1', '100%');
    this.addItem('1.5', '150%');
    this.addItem('2', '200%');
    this.addItem('3', '300%');
    this.addItem('4', '400%');

    this.selectItem('1');

    if (StorageUtils.hasLocalStorage()) {
      let fontCoefficient = window.localStorage.getItem('fontCoefficient');
      if (fontCoefficient != null) {
        this.selectItem(fontCoefficient);
      }
    }

    this.onItemSelected.subscribe((sender: FontSizeSelectBox, value: string) => {
      this.overlay.setFontSize(Number(value));
    });
  }
}
