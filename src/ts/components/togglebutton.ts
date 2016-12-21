import {Button, ButtonConfig} from './button';
import {NoArgs, EventDispatcher, Event} from '../eventdispatcher';
import {DOM} from '../dom';

/**
 * Configuration interface for a toggle button component.
 */
export interface ToggleButtonConfig extends ButtonConfig {
  /**
   * The text on the button.
   */
  text?: string;
}

/**
 * A button that can be toggled between 'on' and 'off' states.
 */
export class ToggleButton<Config extends ToggleButtonConfig> extends Button<ToggleButtonConfig> {

  private static readonly CLASS_ON  = 'on';
  private static readonly CLASS_OFF = 'off';

  private onState: boolean;

  private toggleButtonEvents = {
    onToggle   : new EventDispatcher<ToggleButton<Config>, NoArgs>(),
    onToggleOn : new EventDispatcher<ToggleButton<Config>, NoArgs>(),
    onToggleOff: new EventDispatcher<ToggleButton<Config>, NoArgs>()
  };

  constructor(config: ToggleButtonConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-togglebutton'
    }, this.config);
  }

  /**
   * Toggles the button to the 'on' state.
   */
  on() {
    if (this.isOff()) {
      this.onState = true;
      this.getDomElement().removeClass(this.prefixCss(ToggleButton.CLASS_OFF));
      this.getDomElement().addClass(this.prefixCss(ToggleButton.CLASS_ON));

      this.onToggleEvent();
      this.onToggleOnEvent();
    }
  }

  /**
   * Toggles the button to the 'off' state.
   */
  off() {
    if (this.isOn()) {
      this.onState = false;
      this.getDomElement().removeClass(this.prefixCss(ToggleButton.CLASS_ON));
      this.getDomElement().addClass(this.prefixCss(ToggleButton.CLASS_OFF));

      this.onToggleEvent();
      this.onToggleOffEvent();
    }
  }

  /**
   * Toggle the button 'on' if it is 'off', or 'off' if it is 'on'.
   */
  toggle() {
    if (this.isOn()) {
      this.off();
    } else {
      this.on();
    }
  }

  /**
   * Checks if the toggle button is in the 'on' state.
   * @returns {boolean} true if button is 'on', false if 'off'
   */
  isOn(): boolean {
    return this.onState;
  }

  /**
   * Checks if the toggle button is in the 'off' state.
   * @returns {boolean} true if button is 'off', false if 'on'
   */
  isOff(): boolean {
    return !this.isOn();
  }

  protected onClickEvent() {
    super.onClickEvent();

    // Fire the toggle event together with the click event
    // (they are technically the same, only the semantics are different)
    this.onToggleEvent();
  }

  protected onToggleEvent() {
    this.toggleButtonEvents.onToggle.dispatch(this);
  }

  protected onToggleOnEvent() {
    this.toggleButtonEvents.onToggleOn.dispatch(this);
  }

  protected onToggleOffEvent() {
    this.toggleButtonEvents.onToggleOff.dispatch(this);
  }

  /**
   * Gets the event that is fired when the button is toggled.
   * @returns {Event<ToggleButton<Config>, NoArgs>}
   */
  get onToggle(): Event<ToggleButton<Config>, NoArgs> {
    return this.toggleButtonEvents.onToggle.getEvent();
  }

  /**
   * Gets the event that is fired when the button is toggled 'on'.
   * @returns {Event<ToggleButton<Config>, NoArgs>}
   */
  get onToggleOn(): Event<ToggleButton<Config>, NoArgs> {
    return this.toggleButtonEvents.onToggleOn.getEvent();
  }

  /**
   * Gets the event that is fired when the button is toggled 'off'.
   * @returns {Event<ToggleButton<Config>, NoArgs>}
   */
  get onToggleOff(): Event<ToggleButton<Config>, NoArgs> {
    return this.toggleButtonEvents.onToggleOff.getEvent();
  }
}