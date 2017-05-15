import {SelectBox} from '../selectbox';
import {ListSelectorConfig} from '../listselector';
import {UIInstanceManager} from '../../uimanager';
import {SubtitleOverlay} from '../subtitleoverlay'

/**
 * A select box providing a selection of different font familly.
 */
export class FontFamillySelectBox extends SelectBox {

  private overlay: SubtitleOverlay;

  constructor(config: ListSelectorConfig = {}, overlay: SubtitleOverlay) {
    super(config);
    this.overlay = overlay;
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.addItem('default', 'default');
    this.addItem('monospaced serif', 'monospaced serif');
    this.addItem('proportional serif', 'proportional serif');
    this.addItem('monospaced sans serif', 'monospaced sans serif');
    this.addItem('proportional sans serif', 'proportional sans serif');
    this.addItem('casual', 'casual');
    this.addItem('cursive', 'cursive');
    this.addItem('small capital', 'small capital');

    this.selectItem('default');

    this.onItemSelected.subscribe((sender: FontFamillySelectBox, value: string) => {
      player.setPlaybackSpeed(parseFloat(value));
    });
  }
}
