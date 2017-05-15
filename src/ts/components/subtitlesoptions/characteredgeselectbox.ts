import {SelectBox} from '../selectbox';
import {ListSelectorConfig} from '../listselector';
import {UIInstanceManager} from '../../uimanager';
import {SubtitleOverlay} from '../subtitleoverlay'

/**
 * A select box providing a selection of different character edge.
 */
export class CharacterEdgeSelectBox extends SelectBox {

  private overlay: SubtitleOverlay;

  constructor(config: ListSelectorConfig = {}, overlay: SubtitleOverlay) {
    super(config);
    this.overlay = overlay;
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.addItem('none', 'none');
    this.addItem('raised', 'raised');
    this.addItem('depressed', 'depressed');
    this.addItem('uniform', 'uniform');
    this.addItem('left shadow', 'left_drop_shadow');
    this.addItem('right shadow', 'right_drop_shadow');

    this.selectItem('none');

    this.onItemSelected.subscribe((sender: CharacterEdgeSelectBox, value: string) => {
      player.setPlaybackSpeed(parseFloat(value));
    });
  }
}
