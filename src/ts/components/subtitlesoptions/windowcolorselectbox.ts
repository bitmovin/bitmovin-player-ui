import {SelectBox} from '../selectbox';
import {ListSelectorConfig} from '../listselector';
import {UIInstanceManager} from '../../uimanager';
import {SubtitleOverlay} from '../subtitleoverlay'

/**
 * A select box providing a selection of different background colors.
 */
export class WindowColorSelectBox extends SelectBox {

  private overlay: SubtitleOverlay;

  constructor(config: ListSelectorConfig = {}, overlay: SubtitleOverlay) {
    super(config);
    this.overlay = overlay;
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.addItem('white', 'white');
    this.addItem('black', 'black');
    this.addItem('red', 'red');
    this.addItem('green', 'green');
    this.addItem('blue', 'blue');
    this.addItem('cyan', 'cyan');
    this.addItem('yellow', 'yellow');
    this.addItem('magenta', 'magenta');

    this.selectItem('black');

    this.onItemSelected.subscribe((sender: WindowColorSelectBox, value: string) => {
      this.overlay.setWindowColor(value)
    });
  }
}
