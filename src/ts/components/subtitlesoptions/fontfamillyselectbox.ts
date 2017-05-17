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
    this.addItem('"Courier New",Courier,"Nimbus Mono L","Cutive Mono",monospace', 'monospaced serif');
    this.addItem('"Times New Roman",Times,Georgia,Cambria,"PT Serif Caption",serif', 'proportional serif');
    this.addItem('"Deja Vu Sans Mono","Lucida Console",Monaco,Consolas,"PT Mono",monospace', 'monospaced sans serif');
    this.addItem('Roboto,"Arial Unicode Ms",Arial,Helvetica,Verdana,"PT Sans Caption",sans-serif', 'proportional sans serif');
    this.addItem('"Comic Sans MS",Impact,Handlee,fantasy', 'casual');
    this.addItem('"Monotype Corsiva","URW Chancery L","Apple Chancery","Dancing Script",cursive', 'cursive');
    this.addItem('small-caps', 'small capital');

    this.selectItem('default');

    this.onItemSelected.subscribe((sender: FontFamillySelectBox, value: string) => {
      this.overlay.setFontFamily(value);
    });
  }
}
