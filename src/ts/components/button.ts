import {ComponentConfig, Component} from './component';
import {DOM} from '../dom';
import {EventDispatcher, NoArgs, Event} from '../eventdispatcher';
import { LocalizableText , i18n } from '../localization/i18n';

/**
 * Configuration interface for a {@link Button} component.
 *
 * @category Configs
 */
export interface ButtonConfig extends ComponentConfig {
  /**
   * The text as string or localize callback on the button.
   */
  text?: LocalizableText;
  /**
   * WCAG20 standard for defining info about the component (usually the name)
   */
  ariaLabel?: LocalizableText;

  /**
   * Specifies whether the first touch event received by the {@link UIContainer} should be prevented or not.
   *
   * Default: false
   */
  acceptsTouchWithUiHidden?: boolean;
}

/**
 * A simple clickable button.
 *
 * @category Components
 */
export class Button<Config extends ButtonConfig> extends Component<Config> {

  private buttonEvents = {
    onClick: new EventDispatcher<Button<Config>, NoArgs>(),
  };

  constructor(config: Config) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-button',
      role: 'button',
      tabIndex: 0,
      acceptsTouchWithUiHidden: false,
    } as Config, this.config);
  }

  protected toDomElement(): DOM {
    const buttonElementAttributes: { [name: string]: string } = {
      'id': this.config.id,
      'aria-label': i18n.performLocalization(this.config.ariaLabel || this.config.text),
      'class': this.getCssClasses(),
      'type' : 'button',
      /**
      * WCAG20 standard to display if a button is pressed or not
      */
      'aria-pressed': 'false',
      'tabindex': this.config.tabIndex.toString(),
    };

    if (this.config.role != null) {
      buttonElementAttributes['role'] = this.config.role;
    }

    // Create the button element with the text label
    let buttonElement = new DOM('button', buttonElementAttributes, this).append(new DOM('span', {
      'class': this.prefixCss('label'),
    }).html(i18n.performLocalization(this.config.text)));

    // Listen for the click event on the button element and trigger the corresponding event on the button component
    buttonElement.on('click', () => {
      this.onClickEvent();
    });

    return buttonElement;
  }

  /**
   * Sets text on the label of the button.
   * @param text the text to put into the label of the button
   */
  setText(text: LocalizableText): void {
    this.getDomElement().find('.' + this.prefixCss('label')).html(i18n.performLocalization(text));
  }

  protected onClickEvent() {
    this.buttonEvents.onClick.dispatch(this);
  }

  /**
   * Gets the event that is fired when the button is clicked.
   * @returns {Event<Button<Config>, NoArgs>}
   */
  get onClick(): Event<Button<Config>, NoArgs> {
    return this.buttonEvents.onClick.getEvent();
  }
}
