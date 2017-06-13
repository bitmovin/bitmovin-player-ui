import {SelectBox} from '../selectbox';
import {ListSelectorConfig} from '../listselector';
import {UIInstanceManager} from '../../uimanager';
import {SubtitleOverlay} from '../subtitleoverlay';
import {StorageUtils} from '../../utils';

/**
 * A select box providing a selection of different font colors.
 */
export class FontSizeSelectBox extends SelectBox {

  private overlay: SubtitleOverlay;

  constructor(config: ListSelectorConfig = {}, overlay: SubtitleOverlay ) {
    super(config);
    this.overlay = overlay;
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.addItem('0.5', '50%');
    this.addItem('0.75', '75%');
    this.addItem('1', '100%');
    this.addItem('1.5', '150%');
    this.addItem('2', '200%');
    this.addItem('3', '300%');
    this.addItem('4', '400%');

    this.selectItem('1');

    if (StorageUtils.hasLocalStorage()) {
      let coef = window.localStorage.getItem('coef')
      if (coef != null) {
        this.selectItem(coef)
      }
    }

    this.onItemSelected.subscribe((sender: FontSizeSelectBox, value: string) => {
      this.overlay.setFontSize(Number(value))
    });
  }
}
