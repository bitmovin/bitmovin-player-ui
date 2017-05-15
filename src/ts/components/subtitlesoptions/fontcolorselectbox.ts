import {SelectBox} from '../selectbox';
import {ListSelectorConfig} from '../listselector';
import {UIInstanceManager} from '../../uimanager';
import {SubtitleOverlay} from '../subtitleoverlay'

/**
 * A select box providing a selection of different font colors.
 */
export class FontColorSelectBox extends SelectBox {

  private overlay: SubtitleOverlay;
  private colorState: string;

  constructor(config: ListSelectorConfig = {}, overlay: SubtitleOverlay ) {
    super(config);
    this.overlay = overlay;
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.addItem('ui-subtitle-font-white', 'white');
    this.addItem('ui-subtitle-font-black', 'black');
    this.addItem('ui-subtitle-font-red', 'red');
    this.addItem('ui-subtitle-font-green', 'green');
    this.addItem('ui-subtitle-font-blue', 'blue');
    this.addItem('ui-subtitle-font-cyan', 'cyan');
    this.addItem('ui-subtitle-font-yellow', 'yellow');
    this.addItem('ui-subtitle-font-magenta', 'magenta');

    this.selectItem('white');
    this.colorState = 'ui-subtitle-font-white'

    this.onItemSelected.subscribe((sender: FontColorSelectBox, value: string) => {
      this.overlay.getDomElement().removeClass(this.prefixCss(this.colorState));
      this.overlay.getDomElement().addClass(this.prefixCss(value));
      this.colorState = value;
    });
  }
}
