import {SubtitleSettingSelectBoxConfig, SubtitleSettingSelectBox} from './subtitlesetting';
import {UIInstanceManager} from '../../uimanager';
import {SubtitleOverlay} from '../subtitleoverlay';

/**
 * A select box providing a selection of different character edge.
 */
export class CharacterEdgeSelectBox extends SubtitleSettingSelectBox {

  constructor(config: SubtitleSettingSelectBoxConfig) {
    super(config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.addItem('none', 'none');
    this.addItem('0px 0px 4px rgba(0, 0, 0, 0.9), 0px 1px 4px rgba(0, 0, 0, 0.9), 0px 2px 4px rgba(0, 0, 0, 0.9)', 'raised');
    this.addItem('rgba(0, 0, 0, 0.8) 0px -2px 1px', 'depressed');
    this.addItem('-2px 0px 1px rgba(0, 0, 0, 0.8), 2px 0px 1px rgba(0, 0, 0, 0.8), 0px -2px 1px rgba(0, 0, 0, 0.8), 0px 2px 1px rgba(0, 0, 0, 0.8), -1px 1px 1px rgba(0, 0, 0, 0.8), 1px 1px 1px rgba(0, 0, 0, 0.8), 1px -1px 1px rgba(0, 0, 0, 0.8), 1px 1px 1px rgba(0, 0, 0, 0.8)', 'uniform');
    this.addItem('0px 2px 1px rgba(0, 0, 0, 0.8)', 'drop shadowed');

    this.selectItem('none');

    this.onItemSelected.subscribe((sender: CharacterEdgeSelectBox, value: string) => {
      this.overlay.setCharacterEdge(value);
    });
  }
}
