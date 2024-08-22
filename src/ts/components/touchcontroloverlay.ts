import { Container, ContainerConfig } from './container';
import { SmallCenteredPlaybackToggleButton } from './smallcenteredplaybacktogglebutton';
import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../uimanager';
import { EventDispatcher, NoArgs, Event as EDEvent } from '../eventdispatcher';
import { Timeout } from '../timeout';
import { HTMLElementWithComponent } from '../dom';
import { Label, LabelConfig } from './label';
import { i18n } from '../main';

export interface TouchControlOverlayConfig extends ContainerConfig {
  /**
   * Specify whether the player should be set to enter fullscreen by clicking on the playback toggle button
   * when initiating the initial playback.
   * Default: false.
   */
  enterFullscreenOnInitialPlayback?: boolean;

  /**
   * Specifies whether the first touch event received by the {@link UIContainer} should be prevented or not.
   *
   * Default: true
   */
  acceptsTouchWithUiHidden?: boolean;

  /**
   * Specifies how many seconds are seeked incase user seeks through double-tapping
   * Default: 10sec
   */
  seekTime?: number;

  /**
   * The second tap of a double tap has to be in a specific range of the first tap
   * This specifies how many pixels off the second tap is allowed to be from the first tap
   * in order to trigger the seek events
   *
   * Default: 15px
   */
  seekDoubleTapMargin?: number;
}

interface ClickPosition {
  x: number;
  y: number;
}

/**
 * Overlays the player and detects touch input
 */
export class TouchControlOverlay extends Container<TouchControlOverlayConfig> {
  private readonly SEEK_FORWARD_CLASS = 'seek-forward';
  private readonly SEEK_BACKWARD_CLASS = 'seek-backward';

  private touchControlEvents = {
    onSingleClick: new EventDispatcher<TouchControlOverlay, NoArgs>(),
    onDoubleClick: new EventDispatcher<TouchControlOverlay, NoArgs>(),
    onSeekBackward: new EventDispatcher<TouchControlOverlay, NoArgs>(),
    onSeekForward: new EventDispatcher<TouchControlOverlay, NoArgs>(),
  };

  private playbackToggleButton: SmallCenteredPlaybackToggleButton;
  private seekForwardLabel: Label<LabelConfig>;
  private seekBackwardLabel: Label<LabelConfig>;

  // true if the last tap on the overlay was less than 500msec ago
  private couldBeDoubleTapping: Boolean;
  private doubleTapTimeout: Timeout;

  private latestTapPosition: ClickPosition;

  constructor(config: TouchControlOverlayConfig = {}) {
    super(config);

    this.playbackToggleButton = new SmallCenteredPlaybackToggleButton({
      enterFullscreenOnInitialPlayback: Boolean(config.enterFullscreenOnInitialPlayback),
    });

    this.seekForwardLabel = new Label({text: '', for: this.getConfig().id, cssClass: 'seek-forward-label', hidden: true});
    this.seekBackwardLabel = new Label({text: '', for: this.getConfig().id, cssClass: 'seek-backward-label', hidden: true});

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-touchcontrol-overlay',
      acceptsTouchWithUiHidden: true,
      seekTime: 10,
      seekDoubleTapMargin: 15,
      components: [this.playbackToggleButton, this.seekForwardLabel, this.seekBackwardLabel],
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let playerSeekTime = 0;
    let startSeekTime = 0;

    this.doubleTapTimeout = new Timeout(500, () => {
      this.couldBeDoubleTapping = false;
      startSeekTime = 0;
      setTimeout(() => this.hideSeekAnimationElements(), 150);
    });

    uimanager.onControlsHide.subscribe(() => {
      this.playbackToggleButton.hide();
    });

    uimanager.onControlsShow.subscribe(() => {
      this.playbackToggleButton.show();
    });


    this.touchControlEvents.onSeekBackward.subscribe(() => {
      playerSeekTime -= this.config.seekTime;
      player.seek(playerSeekTime);

      this.seekBackwardLabel.setText(Math.abs(Math.round(playerSeekTime - startSeekTime)) + ' ' + i18n.performLocalization(i18n.getLocalizer('settings.time.seconds')));
      this.seekBackwardLabel.show();
      this.getDomElement().addClass(this.prefixCss(this.SEEK_BACKWARD_CLASS));
      this.seekForwardLabel.hide();
      this.getDomElement().removeClass(this.prefixCss(this.SEEK_FORWARD_CLASS));
    });

    this.touchControlEvents.onSeekForward.subscribe(() => {
      playerSeekTime += this.config.seekTime;
      player.seek(playerSeekTime);

      this.seekForwardLabel.setText(Math.abs(Math.round(playerSeekTime - startSeekTime)) + ' ' + i18n.performLocalization(i18n.getLocalizer('settings.time.seconds')));
      this.seekForwardLabel.show();
      this.getDomElement().addClass(this.prefixCss(this.SEEK_FORWARD_CLASS));
      this.seekBackwardLabel.hide();
      this.getDomElement().removeClass(this.prefixCss(this.SEEK_BACKWARD_CLASS));
    });

    this.touchControlEvents.onSingleClick.subscribe((_, e) => {
      uimanager.getUI().toggleUiShown();
      playerSeekTime = player.getCurrentTime();
      startSeekTime = playerSeekTime;

      const eventTarget = (e as Event).target as HTMLElementWithComponent;
      const rect = eventTarget.getBoundingClientRect();
      const eventTapX = ((<MouseEvent>e).clientX) - rect.left;
      const eventTapY = ((<MouseEvent>e).clientY) - rect.top;
      this.latestTapPosition = {x: eventTapX, y: eventTapY};
    });

    this.touchControlEvents.onDoubleClick.subscribe((_, e) => {
      uimanager.getUI().hideUi();
      const event = e as Event;
      const eventTarget = event.target as HTMLElementWithComponent;
      if (!eventTarget || !((eventTarget).component instanceof TouchControlOverlay)) {
        return;
      }

      const width = eventTarget.clientWidth;
      const tapMargin = width * 0.4;
      const rect = eventTarget.getBoundingClientRect();
      const eventTapX = ((<MouseEvent>e).clientX) - rect.left;
      const eventTapY = ((<MouseEvent>e).clientY) - rect.top;

      const doubleTapMargin = this.config.seekDoubleTapMargin;
      if (Math.abs(this.latestTapPosition.x - eventTapX) <= doubleTapMargin && Math.abs(this.latestTapPosition.y - eventTapY) <= doubleTapMargin)
        if (eventTapX < tapMargin) {
          this.touchControlEvents.onSeekBackward.dispatch(this);
        }
        else if (eventTapX > (width - tapMargin)) {
          this.touchControlEvents.onSeekForward.dispatch(this);
        }
      this.latestTapPosition = {x: eventTapX, y: eventTapY};
    });

    this.getDomElement().on('click', (e) => {
      if ((e.target as HTMLElementWithComponent).component instanceof TouchControlOverlay) {
        clickEventDispatcher(e);
      }
    });

    const clickEventDispatcher = (e: Event): void => {
      if (this.couldBeDoubleTapping) {
        this.onDoubleClickEvent(e);
      } else {
        this.onSingelClickEvent(e);
      }
      this.couldBeDoubleTapping = true;
      this.doubleTapTimeout.start();
    };
  }

  private hideSeekAnimationElements(): void {
    this.getDomElement().removeClass(this.prefixCss(this.SEEK_FORWARD_CLASS));
    this.getDomElement().removeClass(this.prefixCss(this.SEEK_BACKWARD_CLASS));
    this.seekForwardLabel.hide();
    this.seekBackwardLabel.hide();
  }

  protected onDoubleClickEvent(e: Event) {
    this.touchControlEvents.onDoubleClick.dispatch(this, e);
  }

  protected onSingelClickEvent(e: Event) {
    this.touchControlEvents.onSingleClick.dispatch(this, e);
  }

  get onClick(): EDEvent<TouchControlOverlay, NoArgs> {
    return this.touchControlEvents.onSingleClick.getEvent();
  }
}