import {SelectBox} from '../selectbox';
import {ListSelectorConfig} from '../listselector';
import {UIInstanceManager} from '../../uimanager';
import {SubtitleOverlay} from '../subtitleoverlay';
import {Storage} from '../../utils';

/**
 * A select box providing a selection of different font familly.
 */
export class FontFamillySelectBox extends SelectBox {

  private overlay: SubtitleOverlay;

  private fontFamilly: { [key: string]: string} = {
    'default': 'default',
    'monospaced serif': '"Courier New",Courier,"Nimbus Mono L","Cutive Mono",monospace',
    'proportional serif': '"Times New Roman",Times,Georgia,Cambria,"PT Serif Caption",serif',
    'monospaced sans serif': '"Deja Vu Sans Mono","Lucida Console",Monaco,Consolas,"PT Mono",monospace',
    'proportional sans serif': 'Roboto,"Arial Unicode Ms",Arial,Helvetica,Verdana,"PT Sans Caption",sans-serif',
    'casual': '"Comic Sans MS",Impact,Handlee,fantasy',
    'cursive': '"Monotype Corsiva","URW Chancery L","Apple Chancery","Dancing Script",cursive',
    'small capital': 'unset',
  }

  private fontVariant: { [key: string]: string} = {
    'default': 'unset',
    'monospaced serif': 'unset',
    'proportional serif': 'unset',
    'monospaced sans serif': 'unset',
    'proportional sans serif': 'unset',
    'casual': 'unset',
    'cursive': 'unset',
    'small capital': 'small-caps',
  }

  private fontStyle: { [key: string]: string} = {
    'default': 'unset',
    'monospaced serif': 'unset',
    'proportional serif': 'unset',
    'monospaced sans serif': 'unset',
    'proportional sans serif': 'unset',
    'casual': 'unset',
    'cursive': 'italic',
    'small capital': '',
  }

  constructor(config: ListSelectorConfig = {}, overlay: SubtitleOverlay) {
    super(config);
    this.overlay = overlay;
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
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

    if (Storage.hasLocalStorage()) {
      let family = window.localStorage.getItem('family');
      if (family != null) {
        this.selectItem(family);
      }
    }

    this.onItemSelected.subscribe((sender: FontFamillySelectBox, value: string) => {
      this.overlay.setFont(this.fontFamilly[value], this.fontStyle[value], this.fontVariant[value]);
      // Easier than trying to get back to the selected item from font-family, font-variant and font-style
      if (Storage.hasLocalStorage()) {
         window.localStorage.setItem('family', value);
      }
    });
  }
}
