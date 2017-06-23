import {SubtitleSettingSelectBoxConfig, SubtitleSettingSelectBox} from './subtitlesetting';
import {UIInstanceManager} from '../../uimanager';
import {SubtitleOverlay} from '../subtitleoverlay';
import {StorageUtils} from '../../utils';

interface FontFamily {
  name: string;
  family: string;
  variant: string;
  style: string;
}

let fontFamilies: FontFamily[] = [{
  name: 'default',
  family: 'default',
  variant: 'unset',
  style: 'unset',
}, {
  name: 'monospaced serif',
  family: '"Courier New",Courier,"Nimbus Mono L","Cutive Mono",monospace',
  variant: 'unset',
  style: 'unset',
}, {
  name: 'proportional serif',
  family: '"Times New Roman",Times,Georgia,Cambria,"PT Serif Caption",serif',
  variant: 'unset',
  style: 'unset',
}, {
  name: 'monospaced sans serif',
  family: '"Deja Vu Sans Mono","Lucida Console",Monaco,Consolas,"PT Mono",monospace',
  variant: 'unset',
  style: 'unset',
}, {
  name: 'proportional sans serif',
  family: 'Roboto,"Arial Unicode Ms",Arial,Helvetica,Verdana,"PT Sans Caption",sans-serif',
  variant: 'unset',
  style: 'unset',
}, {
  name: 'casual',
  family: '"Comic Sans MS",Impact,Handlee,fantasy',
  variant: 'unset',
  style: 'unset',
}, {
  name: 'cursive',
  family: '"Monotype Corsiva","URW Chancery L","Apple Chancery","Dancing Script",cursive',
  variant: 'unset',
  style: 'italic',
}, {
  name: 'small capital',
  family: 'unset',
  variant: 'small-caps',
  style: 'unset',
},
];

/**
 * A select box providing a selection of different font family.
 */
export class FontFamilySelectBox extends SubtitleSettingSelectBox {

  constructor(config: SubtitleSettingSelectBoxConfig) {
    super(config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    for (let index in fontFamilies) {
      this.addItem(index, fontFamilies[index].name);
    }

    this.selectItem(fontFamilies[0].name);

    if (StorageUtils.hasLocalStorage()) {
      let index = window.localStorage.getItem('family');
      if (index != null) {
        this.selectItem(index);
      }
    }

    this.onItemSelected.subscribe((sender: FontFamilySelectBox, index: string) => {
      let idx = parseInt(index);
      let fontFamily = fontFamilies[idx];
      this.overlay.setFont(fontFamily.family, fontFamily.style, fontFamily.variant);
      // Easier than trying to get back to the selected item from font-family, font-variant and font-style
      if (StorageUtils.hasLocalStorage()) {
         window.localStorage.setItem('family', index);
      }
    });
  }
}
