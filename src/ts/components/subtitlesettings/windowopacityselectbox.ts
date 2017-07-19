import {SubtitleSettingSelectBoxConfig, SubtitleSettingSelectBox} from './subtitlesettingselectbox';
import {UIInstanceManager} from '../../uimanager';

/**
 * A select box providing a selection of different background opacity.
 */
export class WindowOpacitySelectBox extends SubtitleSettingSelectBox {

  constructor(config: SubtitleSettingSelectBoxConfig) {
    super(config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.addItem('1', '100%');
    this.addItem('0.75', '75%');
    this.addItem('0.5', '50%');
    this.addItem('0.25', '25%');
    this.addItem('0', '0%');

    this.selectItem('0');

    let color = this.overlay.style.windowColor;
    if (color != null) {
      this.selectItem(color.a.toString());
    }

    this.onItemSelected.subscribe((sender: WindowOpacitySelectBox, value: string) => {
      this.overlay.setWindowOpacity(Number(value));
    });
  }
}
