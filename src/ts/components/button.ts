import {ComponentConfig, Component} from './component';
import {DOM} from '../dom';
import {EventDispatcher, NoArgs, Event} from '../eventdispatcher';
import { LocalizableText , i18n } from '../localization/i18n';
import { Label, LabelConfig } from './label';

/**
 * Configuration interface for a {@link Button} component.
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
   * Specifies whether the text of the button should be shown when the button is hovered or focused.
   *
   * Default: false
   */
  showTextOnFocus?: boolean;
}

/**
 * A simple clickable button.
 */
export class Button<Config extends ButtonConfig> extends Component<Config> {
  protected textLabel: Label<LabelConfig>;

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
      showTextOnFocus: false,
    } as Config, this.config);

    if (this.config.showTextOnFocus) {
      this.config.cssClasses = this.config.cssClasses.concat('ui-labeledbutton');
    }
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

    this.textLabel = new Label({
      text: i18n.performLocalization(this.config.text),
      for: this.config.id,
      hidden: true,
    });

    // Create the button element with the text label
    let buttonElement = new DOM('button', buttonElementAttributes, this).append(this.textLabel.getDomElement());

    if (this.config.showTextOnFocus) {
      buttonElement.on('focusin', (e) => this.textLabel.show());
      buttonElement.on('mouseenter', (e) => this.textLabel.show());
      buttonElement.on('focusout', (e) => this.textLabel.hide());
      buttonElement.on('mouseleave', (e) => this.textLabel.hide());
    }

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
    this.textLabel.setText(text)
  }

  protected onClickEvent() {
    this.buttonEvents.onClick.dispatch(this);
  }

  initialize(): void {
    super.initialize();
    this.textLabel.initialize();
  }

  release(): void {
    super.release();
    this.textLabel.release();
  }

  /**
   * Gets the event that is fired when the button is clicked.
   * @returns {Event<Button<Config>, NoArgs>}
   */
  get onClick(): Event<Button<Config>, NoArgs> {
    return this.buttonEvents.onClick.getEvent();
  }
}
