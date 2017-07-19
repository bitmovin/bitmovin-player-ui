import {SubtitleSettingSelectBoxConfig, SubtitleSettingSelectBox} from './subtitlesettingselectbox';
import {UIInstanceManager} from '../../uimanager';

/**
 * A select box providing a selection of different font colors.
 */
export class FontOpacitySelectBox extends SubtitleSettingSelectBox {

  constructor(config: SubtitleSettingSelectBoxConfig) {
    super(config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.addItem('0.25', '25%');
    this.addItem('0.50', '50%');
    this.addItem('0.75', '75%');
    this.addItem('1', '100%');

    this.selectItem('1');

    let color = this.overlay.style.fontColor;
    if (color != null) {
      this.selectItem(color.a.toString());
    }

    this.onItemSelected.subscribe((sender: FontOpacitySelectBox, value: string) => {
      this.overlay.setFontOpacity(Number(value));
    });
  }
}
