import { Button, ButtonConfig } from './button';
import { i18n } from '../localization/i18n';
import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../uimanager';
import { PlayerUtils } from '../playerutils';

export enum QuickSeekDirection {
  Forward = 'forward',
  Rewind = 'rewind',
}

export interface QuickSeekButtonConfig extends ButtonConfig {
  /**
   * Specify how many seconds the player should seek forward/backwards in the stream.
   * Default is 10.
   */
  seekSeconds?: number;

  /**
   * Specify whether the button should fast-forward or rewind.
   * Default is rewind.
   */
  direction?: QuickSeekDirection;
}

export class QuickSeekButton extends Button<QuickSeekButtonConfig> {
  constructor(config: QuickSeekButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        seekSeconds: 10,
        direction: QuickSeekDirection.Rewind,
        cssClass: 'ui-quickseekbutton',
      },
      this.config,
    );

    this.config.text =
      this.config.text ||
      i18n.getLocalizer(`quickseek.${this.config.direction}`);
    this.config.ariaLabel =
      this.config.ariaLabel ||
      i18n.getLocalizer(`quickseek.${this.config.direction}`);

    this.getDomElement().data(
      this.prefixCss('seek-direction'),
      this.config.direction,
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    if (player.isLive()) {
      this.hide();
    }

    this.onClick.subscribe(() => {
      if (player.isLive()) {
        return;
      }

      const currentPosition = player.getCurrentTime();

      let newSeekTime = 0;
      if (this.config.direction === QuickSeekDirection.Forward) {
        newSeekTime = currentPosition + this.config.seekSeconds;
      } else if (this.config.direction === QuickSeekDirection.Rewind) {
        newSeekTime = currentPosition - this.config.seekSeconds;
      }

      player.seek(newSeekTime);
    });
  }
}
