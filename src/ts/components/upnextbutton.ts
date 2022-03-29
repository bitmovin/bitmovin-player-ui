import {ButtonConfig, Button} from './button';
import {DOM} from '../dom';
import {UIInstanceManager} from '../uimanager';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../localization/i18n';

/**
 * A button to play/replay a video.
 */
export class UpNextButton extends Button<ButtonConfig> {

  constructor(config: ButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-upnextbutton',
      text: i18n.getLocalizer('nextEpisode'),
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    const goToNext = () => {
      if (player.getSource()?.metadata?.upNext?.goToNext) {
        player.getSource()?.metadata?.upNext?.goToNext();
      }
      this.hide();
    };

    let goToNextTimeout: NodeJS.Timeout;

    this.onClick.subscribe(() => {
      goToNext();
    });

    // @ts-ignore
    player.on(player.exports.PlayerEvent.TimeChanged, ({ time }) => {
      const showTime = player.getSource()?.metadata?.upNext?.showTime;

      if (showTime > 0 && showTime <= time && this.isHidden()) {
        this.show();
        this.getDomElement().addClass(this.prefixCss('animating'));

        goToNextTimeout = setTimeout(() => {
          if (this.getDomElement().hasClass(this.prefixCss('animating'))) {
            goToNext();
          }
        }, 6000);

        const hoverHandler = () => {
          this.getDomElement().removeClass(this.prefixCss('animating'));
          document.getElementById('bitmovin-player').removeEventListener('mouseover', hoverHandler);
          clearTimeout(goToNextTimeout);
        };

        document.getElementById('bitmovin-player').addEventListener('mouseover', hoverHandler);
      } else if (showTime >= time && this.isShown()) {
        this.hide();
        this.getDomElement().removeClass(this.prefixCss('animating'));
        clearTimeout(goToNextTimeout);
      }
    });

    this.hide();
  }

  protected toDomElement(): DOM {
    let buttonElement = super.toDomElement();

    // Add child that contains the play button image
    // Setting the image directly on the button does not work together with scaling animations, because the button
    // can cover the whole video player are and scaling would extend it beyond. By adding an inner element, confined
    // to the size if the image, it can scale inside the player without overshooting.
    const animationWrapper = new DOM('div', {
      'class': this.prefixCss('animation-wrapper'),
    });

    animationWrapper.append(new DOM('div', {
      'class': this.prefixCss('animation'),
    }));

    animationWrapper.append(new DOM('div', {
      'class': this.prefixCss('icon'),
    }));

    animationWrapper.append(new DOM('div', {
      'class': this.prefixCss('text'),
    }).html('Next Episode'));


    buttonElement.append(animationWrapper);

    return buttonElement;
  }
}