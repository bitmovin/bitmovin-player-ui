import {SubtitleSettingConfig, SubtitleSettingSelectBox} from './subtitlesetting';
import {UIInstanceManager} from '../../uimanager';
import {SubtitleOverlay} from '../subtitleoverlay';
import {ColorUtils, StorageUtils} from '../../utils';

/**
 * A select box providing a selection of different background colors.
 */
export class WindowColorSelectBox extends SubtitleSettingSelectBox {

  constructor(config: SubtitleSettingConfig) {
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

    // black is the default value
    this.selectItem('rgba(0, 0, 0, 1)');

    if (StorageUtils.hasLocalStorage()) {
      let color = window.localStorage.getItem('windowColor');
      if (color != null) {
        let col = ColorUtils.colorFromCss(color, ColorUtils.background);
        col.a = 1;
        this.selectItem(col.toCSS());
      }
    }

    this.onItemSelected.subscribe((sender: WindowColorSelectBox, value: string) => {
      this.overlay.setWindowColor(value);
    });
  }
}
