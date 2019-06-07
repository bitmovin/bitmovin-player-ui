import {Button, ButtonConfig} from './button';
import {NoArgs, EventDispatcher, Event} from '../eventdispatcher';
import { UIInstanceManager } from '../uimanager';
import { PlayerAPI } from 'bitmovin-player';

/**
 * Configuration interface for a toggle button component.
 */
export interface ToggleButtonConfig extends ButtonConfig {
  /**
   * The CSS class that marks the on-state of the button.
   */
  onClass?: string;
  /**
   * The CSS class that marks the off-state of the button.
   */
  offClass?: string;
  /**
   * The text on the button.
   */
  text?: string;
}

/**
 * A button that can be toggled between 'on' and 'off' states.
 */
export class ToggleButton<Config extends ToggleButtonConfig> extends Button<Config> {

  private onState: boolean;

  private toggleButtonEvents = {
    onToggle: new EventDispatcher<ToggleButton<Config>, NoArgs>(),
    onToggleOn: new EventDispatcher<ToggleButton<Config>, NoArgs>(),
    onToggleOff: new EventDispatcher<ToggleButton<Config>, NoArgs>(),
  };

  constructor(config: Config) {
    super(config);

    const defaultConfig: ToggleButtonConfig = {
      cssClass: 'ui-togglebutton',
      onClass: 'on',
      offClass: 'off',
    };

    this.config = this.mergeConfig(config, defaultConfig as Config, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);
    const config = this.getConfig();
    this.getDomElement().addClass(this.prefixCss(config.offClass));
  }

  /**
   * Toggles the button to the 'on' state.
   */
  on() {
    if (this.isOff()) {
      const config = this.getConfig();

      this.onState = true;
      this.getDomElement().removeClass(this.prefixCss(config.offClass));
      this.getDomElement().addClass(this.prefixCss(config.onClass));

      this.onToggleEvent();
      this.onToggleOnEvent();
    }
  }

  /**
   * Toggles the button to the 'off' state.
   */
  off() {
    if (this.isOn()) {
      const config = this.getConfig();

      this.onState = false;
      this.getDomElement().removeClass(this.prefixCss(config.onClass));
      this.getDomElement().addClass(this.prefixCss(config.offClass));

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