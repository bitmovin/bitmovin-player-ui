import { ComponentConfig, Component } from '../Component';
import { DOM } from '../../DOM';
import { EventDispatcher, NoArgs, Event } from '../../EventDispatcher';
import { LocalizableText, i18n } from '../../localization/i18n';
import { Icon } from '../Icon';

/**
 * Configures the style of a {@link Button} component.
 */
export enum ButtonStyle {
  /**
   * Only display the button as an icon.
   */
  Icon = 'icon',
  /**
   * Only display the button as text.
   */
  Text = 'text',
  /**
   * Display the button with an icon and text.
   * The Icon is displayed before the text.
   */
  TextWithLeadingIcon = 'text-icon-leading',
  /**
   * Display the button with an icon and text.
   * The Icon is displayed after the text.
   */
  TextWithTrailingIcon = 'text-icon-trailing',
}

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

  /**
   * The style of the button.
   * Default: {@link ButtonStyle.Icon}
   */
  buttonStyle?: ButtonStyle;
}

/**
 * A simple clickable button.
 *
 * @category Components
 */
export class Button<Config extends ButtonConfig> extends Component<Config> {
  private static readonly CLASS_TOUCHED = 'touched';

  private buttonEvents = {
    onClick: new EventDispatcher<Button<Config>, NoArgs>(),
  };

  constructor(config: Config) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-button',
        role: 'button',
        tabIndex: 0,
        acceptsTouchWithUiHidden: false,
        buttonStyle: ButtonStyle.Icon,
      } as Config,
      this.config,
    );
  }

  protected toDomElement(): DOM {
    const buttonElementAttributes: { [name: string]: string } = {
      id: this.config.id,
      'aria-label': i18n.performLocalization(this.config.ariaLabel || this.config.text),
      class: this.getCssClasses(),
      type: 'button',
      tabindex: this.config.tabIndex.toString(),
    };

    if (this.config.role != null) {
      buttonElementAttributes['role'] = this.config.role;
    }

    // Create the button element with the text label
    const buttonElement = new DOM('button', buttonElementAttributes, this);

    const addIconElement = () => {
      const icon = new Icon({ ariaLabel: this.config.ariaLabel, altText: this.config.text });
      buttonElement.append(icon.getDomElement());
    };

    const addLabelElement = () => {
      buttonElement.append(
        new DOM('span', { class: this.prefixCss('label') }).html(i18n.performLocalization(this.config.text)),
      );
    };

    switch (this.config.buttonStyle) {
      case ButtonStyle.Icon:
        addIconElement();
        break;
      case ButtonStyle.Text:
        addLabelElement();
        break;
      case ButtonStyle.TextWithLeadingIcon:
        addIconElement();
        addLabelElement();
        break;
      case ButtonStyle.TextWithTrailingIcon:
        addLabelElement();
        addIconElement();
        break;
    }

    // Listen for the click event on the button element and trigger the corresponding event on the button component
    buttonElement.on('click', e => {
      e.preventDefault();
      this.onClickEvent();
    });

    buttonElement.on('touchstart', e => {
      this.getDomElement().addClass(Button.CLASS_TOUCHED);
    });

    buttonElement.on('touchend', e => {
      this.getDomElement().removeClass(Button.CLASS_TOUCHED);
    });

    return buttonElement;
  }

  /**
   * Sets text on the label of the button.
   * @param text the text to put into the label of the button
   */
  setText(text: LocalizableText): void {
    this.getDomElement()
      .find('.' + this.prefixCss('label'))
      .html(i18n.performLocalization(text));
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
