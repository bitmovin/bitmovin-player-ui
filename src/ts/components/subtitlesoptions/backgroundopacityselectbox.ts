import {SelectBox} from '../selectbox';
import {ListSelectorConfig} from '../listselector';
import {UIInstanceManager} from '../../uimanager';
import {SubtitleOverlay} from '../subtitleoverlay'
import {ColorUtils, Storage} from '../../utils';

/**
 * A select box providing a selection of different background opacity.
 */
export class BackgroundOpacitySelectBox extends SelectBox {

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
    this.addItem('0', '0%') ;

    this.selectItem('0');

    if (Storage.hasLocalStorage()) {
      let color = window.localStorage.getItem('backgroundColor');
      if (color != null) {
        let col = ColorUtils.colorFromCss(color, ColorUtils.background);
        this.selectItem(col.a.toString());
      }
    }

    this.onItemSelected.subscribe((sender: BackgroundOpacitySelectBox, value: string) => {
      this.overlay.setBackgroundOpacity(Number(value));
    });
  }
}
