import {SubtitleSettingSelectBoxConfig, SubtitleSettingSelectBox} from './subtitlesettingselectbox';
import {UIInstanceManager} from '../../uimanager';

/**
 * A select box providing a selection of different background colors.
 */
export class BackgroundColorSelectBox extends SubtitleSettingSelectBox {

  constructor(config: SubtitleSettingSelectBoxConfig) {
    super(config);
    this.overlay = config.overlay;
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

    // black is the default value
    this.selectItem('rgba(0, 0, 0, 1)');

    let color = this.overlay.style.backgroundColor;
    if (color != null) {
      color = color.clone();
      color.a = 1;
      this.selectItem(color.toCSS());
    }

    this.onItemSelected.subscribe((sender: BackgroundColorSelectBox, value: string) => {
      this.overlay.setBackgroundColor(value);
    });
  }
}
