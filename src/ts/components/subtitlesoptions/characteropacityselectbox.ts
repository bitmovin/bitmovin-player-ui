import {SelectBox} from '../selectbox';
import {ListSelectorConfig} from '../listselector';
import {UIInstanceManager} from '../../uimanager';
import {SubtitleOverlay} from '../subtitleoverlay'

/**
 * A select box providing a selection of different character opacity.
 */
export class CharacterOpacitySelectBox extends SelectBox {

  private overlay: SubtitleOverlay;

  constructor(config: ListSelectorConfig = {}, overlay: SubtitleOverlay) {
    super(config);
    this.overlay = overlay;
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.addItem('1', '100%') ;
    this.addItem('0.75', '75%') ;
    this.addItem('0.5', '50%') ;
    this.addItem('0.25', '25%') ;

    this.selectItem('1');

    this.onItemSelected.subscribe((sender: CharacterOpacitySelectBox, value: string) => {
      player.setPlaybackSpeed(parseFloat(value));
    });
  }
}
