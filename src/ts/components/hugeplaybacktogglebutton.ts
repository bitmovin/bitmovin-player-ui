import {ToggleButtonConfig} from './togglebutton';
import {PlaybackToggleButton} from './playbacktogglebutton';
import {DOM} from '../dom';
import {UIInstanceManager} from '../uimanager';
import { PlayerAPI, PlayerEventBase, WarningEvent } from 'bitmovin-player';
import { i18n } from '../localization/i18n';

/**
 * A button that overlays the video and toggles between playback and pause.
 */
export class HugePlaybackToggleButton extends PlaybackToggleButton {

  constructor(config: ToggleButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-hugeplaybacktogglebutton',
      text: i18n.getLocalizer('playPause'),
      role: 'button',
      ariaLabel: i18n.getLocalizer('playPause'),
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    // Update button state through API events
    super.configure(player, uimanager, false);

    let togglePlayback = () => {
      if (player.isPlaying() || this.isPlayInitiated) {
        player.pause('ui');
      } else {
        player.play('ui');
      }
    };

    let toggleFullscreen = () => {
      if (player.getViewMode() === player.exports.ViewMode.Fullscreen) {
        player.setViewMode(player.exports.ViewMode.Inline);
      } else {
        player.setViewMode(player.exports.ViewMode.Fullscreen);
      }
    };

    let firstPlay = true;
    let clickTime = 0;
    let doubleClickTime = 0;

    /*
     * YouTube-style toggle button handling
     *
     * The goal is to prevent a short pause or playback interval between a click, that toggles playback, and a
     * double click, that toggles fullscreen. In this naive approach, the first click would e.g. start playback,
     * the second click would be detected as double click and toggle to fullscreen, and as second normal click stop
     * playback, which results is a short playback interval with max length of the double click detection
     * period (usually 500ms).
     *
     * To solve this issue, we defer handling of the first click for 200ms, which is almost unnoticeable to the user,
     * and just toggle playback if no second click (double click) has been registered during this period. If a double
     * click is registered, we just toggle the fullscreen. In the first 200ms, undesired playback changes thus cannot
     * happen. If a double click is registered within 500ms, we undo the playback change and switch fullscreen mode.
     * In the end, this method basically introduces a 200ms observing interval in which playback changes are prevented
     * if a double click happens.
     */
    this.onClick.subscribe(() => {
      // Directly start playback on first click of the button.
      // This is a required workaround for mobile browsers where video playback needs to be triggered directly
      // by the user. A deferred playback start through the timeout below is not considered as user action and
      // therefore ignored by mobile browsers.
      if (firstPlay) {
        // Try to start playback. Then we wait for Play and only when it arrives, we disable the firstPlay flag.
        // If we disable the flag here, onClick was triggered programmatically instead of by a user interaction, and
        // playback is blocked (e.g. on mobile devices due to the programmatic play() call), we loose the chance to
        // ever start playback through a user interaction again with this button.
        togglePlayback();
        return;
      }

      let now = Date.now();

      if (now - clickTime < 200) {
        // We have a double click inside the 200ms interval, just toggle fullscreen mode
        toggleFullscreen();
        doubleClickTime = now;
        return;
      } else if (now - clickTime < 500) {
        // We have a double click inside the 500ms interval, undo playback toggle and toggle fullscreen mode
        toggleFullscreen();
        togglePlayback();
        doubleClickTime = now;
        return;
      }

      clickTime = now;

      setTimeout(() => {
        if (Date.now() - doubleClickTime > 200) {
          // No double click detected, so we toggle playback and wait what happens next
          togglePlayback();
        }
      }, 200);
    });

    player.on(player.exports.PlayerEvent.Play, () => {
      // Playback has really started, we can disable the flag to switch to normal toggle button handling
      firstPlay = false;
    });

    player.on(player.exports.PlayerEvent.Warning, (event: WarningEvent) => {
      if (event.code === player.exports.WarningCode.PLAYBACK_COULD_NOT_BE_STARTED) {
        // if playback could not be started, reset the first play flag as we need the user interaction to start
        firstPlay = true;
      }
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

    const isAutoplayEnabled = player.getConfig().playback && Boolean(player.getConfig().playback.autoplay);
    // We only know if an autoplay attempt is upcoming if the player is not yet ready. It the player is already ready,
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
      'aria-hidden': 'true',
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
