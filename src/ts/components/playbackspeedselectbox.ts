import {SelectBox} from './selectbox';
import {ListSelectorConfig} from './listselector';
import {UIInstanceManager} from '../uimanager';

/**
 * A select box providing a selection of different playback speeds.
 */
export class PlaybackSpeedSelectBox extends SelectBox {

  constructor(config: ListSelectorConfig = {}) {
    super(config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.addItem('0.25', '0.25x');
    this.addItem('0.5', '0.5x');
    this.addItem('1', 'Normal');
    this.addItem('1.5', '1.5x');
    this.addItem('2', '2x');

    this.selectItem('1');


    this.onItemSelected.subscribe((sender: PlaybackSpeedSelectBox, value: string) => {
      player.setPlaybackSpeed(parseFloat(value));
    });
  }
}