import {PlaybackToggleButton, PlaybackToggleButtonConfig} from './playbacktogglebutton';
import {DOM} from '../dom';
import {UIInstanceManager} from '../uimanager';
import { PlayerAPI, PlayerEventBase, WarningEvent } from 'bitmovin-player';
import { i18n } from '../localization/i18n';

export class SmallCenteredPlaybackToggleButton extends PlaybackToggleButton {

  constructor(config: PlaybackToggleButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-smallcenteredplaybacktogglebutton',
      text: i18n.getLocalizer('playPause'),
      role: 'button',
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    // Update button state through API events
    super.configure(player, uimanager, false);

    // Set enterFullscreenOnInitialPlayback if set in the uimanager config
    if (typeof uimanager.getConfig().enterFullscreenOnInitialPlayback === 'boolean') {
      this.config.enterFullscreenOnInitialPlayback = uimanager.getConfig().enterFullscreenOnInitialPlayback;
    }

    let togglePlayback = () => {
      if (player.isPlaying() || this.isPlayInitiated) {
        player.pause('ui');
      } else {
        player.play('ui');
      }
    };

    let firstPlay = true;

    this.onClick.subscribe(() => {
      togglePlayback();

      if (firstPlay && this.config.enterFullscreenOnInitialPlayback) {
        player.setViewMode(player.exports.ViewMode.Fullscreen);
      }
    });

    player.on(player.exports.PlayerEvent.Playing, () => {
      // Playback has really started, we can disable the flag to switch to normal toggle button handling
      firstPlay = false;
    });

    const suppressPlayButtonTransitionAnimation = () => {
      // Disable the current animation
      this.setTransitionAnimationsEnabled(false);

      // Enable the transition animations for the next state change
      this.onToggle.subscribeOnce(() => {
        this.setTransitionAnimationsEnabled(true);
      });
    };

    // Hide the play button animation when the UI is loaded (it should only be animated on state changes)
    suppressPlayButtonTransitionAnimation();

    const isAutoplayEnabled = Boolean(player.getConfig().playback?.autoplay);
    // We only know if an autoplay attempt is upcoming if the player is not yet ready. If the player is already ready,
    // the attempt might be upcoming or might have already happened, but we don't have to handle that because we can
    // simply rely on isPlaying and the play state events.
    const isAutoplayUpcoming = !player.getSource() && isAutoplayEnabled;

    // Hide the play button when the player is already playing or autoplay is upcoming
    if (player.isPlaying() || isAutoplayUpcoming) {
      // Hide the play button (switch to playing state)
      this.on();
      // Disable the animation of the playing state switch
      suppressPlayButtonTransitionAnimation();

      // Show the play button without an animation if a play attempt is blocked
      player.on(player.exports.PlayerEvent.Warning, (event: WarningEvent) => {
        if (event.code === player.exports.WarningCode.PLAYBACK_COULD_NOT_BE_STARTED) {
          suppressPlayButtonTransitionAnimation();
        }
      });
    }
  }

  protected toDomElement(): DOM {
    let buttonElement = super.toDomElement();

    // Add child that contains the play button image
    // Setting the image directly on the button does not work together with scaling animations, because the button
    // can cover the whole video player are and scaling would extend it beyond. By adding an inner element, confined
    // to the size if the image, it can scale inside the player without overshooting.
    buttonElement.append(new DOM('div', {
      'class': this.prefixCss('image'),
    }));

    return buttonElement;
  }

  /**
   * Enables or disables the play state transition animations of the play button image. Can be used to suppress
   * animations.
   * @param {boolean} enabled true to enable the animations (default), false to disable them
   */
  protected setTransitionAnimationsEnabled(enabled: boolean): void {
    const noTransitionAnimationsClass = this.prefixCss('no-transition-animations');

    if (enabled) {
      this.getDomElement().removeClass(noTransitionAnimationsClass);
    } else if (!this.getDomElement().hasClass(noTransitionAnimationsClass)) {
      this.getDomElement().addClass(noTransitionAnimationsClass);
    }
  }
}
