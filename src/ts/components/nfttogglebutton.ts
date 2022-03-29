import {ToggleButton, ToggleButtonConfig} from './togglebutton';
import {UIInstanceManager} from '../uimanager';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../localization/i18n';
import {DOM} from '../dom';

/**
 * A button that toggles between playback and pause.
 */
export class NftToggleButton extends ToggleButton<ToggleButtonConfig> {
  constructor(config: ToggleButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-nfttogglebutton',
      text: i18n.getLocalizer('nft'),
      onAriaLabel: i18n.getLocalizer('disable nft view'),
      offAriaLabel: i18n.getLocalizer('enable nft view'),
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager, handleClickEvent: boolean = true): void {
    super.configure(player, uimanager);

    this.onClick.subscribe(() => {
      const controlBar = new DOM('.bmpui-ui-controlbar');
      this.toggle();
      if (this.isOn()) {
        controlBar.addClass('show-nft-display');
      } else {
        controlBar.removeClass('show-nft-display');
      }
      player.getSource()?.metadata?.nifty?.toggleNftDisplay(this.isOn());
    });

    player.on(player.exports.PlayerEvent.Playing, () => {
      const controlBar = new DOM('.bmpui-ui-controlbar');

      controlBar.addClass('user-has-interacted');
    });

    player.on(player.exports.PlayerEvent.Seeked, () => {
      const controlBar = new DOM('.bmpui-ui-controlbar');

      controlBar.addClass('user-has-interacted');
    });

    player.on(player.exports.PlayerEvent.SourceLoaded, () => {
      const controlBar = new DOM('.bmpui-ui-controlbar');

      controlBar.removeClass('user-has-interacted');

      if (player.getSource()?.metadata?.nifty?.nftEnabled) {
        this.show();
        this.on();
        controlBar.addClass('show-nft-display');
      } else {
        this.hide();
        controlBar.removeClass('show-nft-display');
      }
    });

    this.hide();
  }
}
