import {SelectBox} from '../selectbox';
import {ListSelectorConfig} from '../listselector';
import {UIInstanceManager} from '../../uimanager';

/**
 * A select box providing a selection of different playback speeds.
 */
export class FontColorSelectBox extends SelectBox {

  constructor(config: ListSelectorConfig = {}) {
    super(config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.addItem('blue', 'blue');
    this.addItem('green', 'green');
    this.addItem('yellow', 'yellow');

    this.selectItem('1');


    this.onItemSelected.subscribe((sender: FontColorSelectBox, value: string) => {
      player.setPlaybackSpeed(parseFloat(value));
    });
  }
}
