import {SelectBox} from '../selectbox';
import {ListSelectorConfig} from '../listselector';
import {UIInstanceManager} from '../../uimanager';
import {SubtitleOverlay} from '../subtitleoverlay'

/**
 * A select box providing a selection of different background colors.
 */
export class BackgroundColorSelectBox extends SelectBox {

  private overlay: SubtitleOverlay;
  private colorState: string;

  constructor(config: ListSelectorConfig = {}, overlay: SubtitleOverlay) {
    super(config);
    this.overlay = overlay;
  }

  configure(player: bitmovin.player.Player, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.addItem('ui-subtitle-background-white', 'white');
    this.addItem('ui-subtitle-background-black', 'black');
    this.addItem('ui-subtitle-background-red', 'red');
    this.addItem('ui-subtitle-background-green', 'green');
    this.addItem('ui-subtitle-background-blue', 'blue');
    this.addItem('ui-subtitle-background-cyan', 'cyan');
    this.addItem('ui-subtitle-background-yellow', 'yellow');
    this.addItem('ui-subtitle-background-magenta', 'magenta');

    this.selectItem('white');
    this.colorState = 'ui-subtitle-font-white'

    this.onItemSelected.subscribe((sender: BackgroundColorSelectBox, value: string) => {
      this.overlay.getDomElement().removeClass(this.prefixCss(this.colorState));
      this.overlay.getDomElement().addClass(this.prefixCss(value));
      this.colorState = value;
    });
  }
}
