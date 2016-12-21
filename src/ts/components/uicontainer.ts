import {ContainerConfig, Container} from './container';
import {NoArgs, EventDispatcher, Event} from '../eventdispatcher';
import {UIManager} from '../uimanager';
import {DOM} from '../dom';

/**
 * Configuration interface for a {@link UIContainer}.
 */
export interface UIContainerConfig extends ContainerConfig {
  // nothing to add
}

/**
 * The base container that contains all of the UI. The UIContainer is passed to the {@link UIManager} to build and
 * setup the UI.
 */
export class UIContainer extends Container<UIContainerConfig> {

  private static readonly STATE_IDLE     = 'player-state-idle';
  private static readonly STATE_PLAYING  = 'player-state-playing';
  private static readonly STATE_PAUSED   = 'player-state-paused';
  private static readonly STATE_FINISHED = 'player-state-finished';

  private static readonly FULLSCREEN = 'fullscreen';
  private static readonly BUFFERING  = 'buffering';

  private uiContainerEvents = {
    onMouseEnter: new EventDispatcher<UIContainer, NoArgs>(),
    onMouseMove : new EventDispatcher<UIContainer, NoArgs>(),
    onMouseLeave: new EventDispatcher<UIContainer, NoArgs>()
  };

  constructor(config: UIContainerConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-uicontainer'
    }, this.config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIManager): void {
    super.configure(player, uimanager);

    let self = this;

    self.onMouseEnter.subscribe(function(sender) {
      uimanager.onMouseEnter.dispatch(sender);
    });
    self.onMouseMove.subscribe(function(sender) {
      uimanager.onMouseMove.dispatch(sender);
    });
    self.onMouseLeave.subscribe(function(sender) {
      uimanager.onMouseLeave.dispatch(sender);
    });

    // Player states
    let removeStates = function() {
      self.getDomElement().removeClass(self.prefixCss(UIContainer.STATE_IDLE));
      self.getDomElement().removeClass(self.prefixCss(UIContainer.STATE_PLAYING));
      self.getDomElement().removeClass(self.prefixCss(UIContainer.STATE_PAUSED));
      self.getDomElement().removeClass(self.prefixCss(UIContainer.STATE_FINISHED));
    };
    player.addEventHandler(bitmovin.player.EVENT.ON_READY, function() {
      removeStates();
      self.getDomElement().addClass(self.prefixCss(UIContainer.STATE_IDLE));
    });
    player.addEventHandler(bitmovin.player.EVENT.ON_PLAY, function() {
      removeStates();
      self.getDomElement().addClass(self.prefixCss(UIContainer.STATE_PLAYING));
    });
    player.addEventHandler(bitmovin.player.EVENT.ON_PAUSED, function() {
      removeStates();
      self.getDomElement().addClass(self.prefixCss(UIContainer.STATE_PAUSED));
    });
    player.addEventHandler(bitmovin.player.EVENT.ON_PLAYBACK_FINISHED, function() {
      removeStates();
      self.getDomElement().addClass(self.prefixCss(UIContainer.STATE_FINISHED));
    });
    // Init in idle state
    self.getDomElement().addClass(self.prefixCss(UIContainer.STATE_IDLE));

    // Fullscreen marker class
    player.addEventHandler(bitmovin.player.EVENT.ON_FULLSCREEN_ENTER, function() {
      self.getDomElement().addClass(self.prefixCss(UIContainer.FULLSCREEN));
    });
    player.addEventHandler(bitmovin.player.EVENT.ON_FULLSCREEN_EXIT, function() {
      self.getDomElement().removeClass(self.prefixCss(UIContainer.FULLSCREEN));
    });

    // Buffering marker class
    player.addEventHandler(bitmovin.player.EVENT.ON_STALL_STARTED, function() {
      self.getDomElement().addClass(self.prefixCss(UIContainer.BUFFERING));
    });
    player.addEventHandler(bitmovin.player.EVENT.ON_STALL_ENDED, function() {
      self.getDomElement().removeClass(self.prefixCss(UIContainer.BUFFERING));
    });
  }

  protected toDomElement(): DOM {
    let self      = this;
    let container = super.toDomElement();

    container.on('mouseenter', function() {
      self.onMouseEnterEvent();
    });
    container.on('mousemove', function() {
      self.onMouseMoveEvent();
    });
    container.on('mouseleave', function() {
      self.onMouseLeaveEvent();
    });

    // Detect flexbox support (not supported in IE9)
    if (document && typeof document.createElement('p').style.flex !== 'undefined') {
      container.addClass(self.prefixCss('flexbox'));
    } else {
      container.addClass(self.prefixCss('no-flexbox'));
    }

    return container;
  }

  protected onMouseEnterEvent() {
    this.uiContainerEvents.onMouseEnter.dispatch(this);
  }

  protected onMouseMoveEvent() {
    this.uiContainerEvents.onMouseMove.dispatch(this);
  }

  protected onMouseLeaveEvent() {
    this.uiContainerEvents.onMouseLeave.dispatch(this);
  }

  /**
   * Gets the event that is fired when the mouse enters the UI.
   * @returns {Event<UIContainer, NoArgs>}
   */
  get onMouseEnter(): Event<UIContainer, NoArgs> {
    return this.uiContainerEvents.onMouseEnter.getEvent();
  }

  /**
   * Gets the event that is fired when the mouse moves within UI.
   * @returns {Event<UIContainer, NoArgs>}
   */
  get onMouseMove(): Event<UIContainer, NoArgs> {
    return this.uiContainerEvents.onMouseMove.getEvent();
  }

  /**
   * Gets the event that is fired when the mouse leaves the UI.
   * @returns {Event<UIContainer, NoArgs>}
   */
  get onMouseLeave(): Event<UIContainer, NoArgs> {
    return this.uiContainerEvents.onMouseLeave.getEvent();
  }
}