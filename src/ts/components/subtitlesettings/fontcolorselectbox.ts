import {SubtitleSettingSelectBoxConfig, SubtitleSettingSelectBox} from './subtitlesettingselectbox';
import {UIInstanceManager} from '../../uimanager';

/**
 * A select box providing a selection of different font colors.
 */
export class FontColorSelectBox extends SubtitleSettingSelectBox {

  constructor(config: SubtitleSettingSelectBoxConfig) {
    super(config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.addItem('rgba(255, 255, 255, 1)', 'white');
    this.addItem('rgba(0, 0, 0, 1)', 'black');
    this.addItem('rgba(255, 0, 0, 1)', 'red');
    this.addItem('rgba(0, 255, 0, 1)', 'green');
    this.addItem('rgba(0, 0, 255, 1)', 'blue');
    this.addItem('rgba(0, 255, 255, 1)', 'cyan');
    this.addItem('rgba(255, 255, 0, 1)', 'yellow');
    this.addItem('rgba(255, 0, 255, 1)', 'magenta');

    // white as the default value
    this.selectItem('rgba(255, 255, 255, 1)');

    let color = this.overlay.style.fontColor;
    if (color != null) {
      color = color.clone();
      color.a = 1; // All colors are defined with default opacity
      this.selectItem(color.toCSS());
    }

    this.onItemSelected.subscribe((sender: FontColorSelectBox, value: string) => {
      this.overlay.setColor(value);
    });
  }
}
