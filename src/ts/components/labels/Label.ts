import { ComponentConfig, Component } from '../Component';
import { DOM } from '../../DOM';
import { EventDispatcher, Event, NoArgs } from '../../EventDispatcher';
import { LocalizableText, i18n } from '../../localization/i18n';
import { Icon } from '../Icon';
import { UIManager } from '../../UIManager';

export enum LabelStyle {
  /**
   * Only display the label text.
   */
  Text = 'text',
  /**
   * Display the label with an icon and text.
   * The Icon is displayed before the text.
   */
  TextWithLeadingIcon = 'text-icon-leading',
  /**
   * Display the label with an icon and text.
   * The Icon is displayed after the text.
   */
  TextWithTrailingIcon = 'text-icon-trailing',
}

/**
 * Configuration interface for a {@link Label} component.
 *
 * @category Configs
 */
export interface LabelConfig extends ComponentConfig {
  /**
   * The text as string or localize callback on the label.
   */
  text?: LocalizableText;

  /**
   * WCAG20 standard: Associate label to form control.
   */
  for?: string;

  /**
   * The style of the label.
   * Default: {@link LabelStyle.Text}
   */
  labelStyle?: LabelStyle;
}

/**
 * A text label with optional icon.
 *
 * DOM example:
 * <code>
 *     <span class='ui-label'>
 *         <span class='ui-label-text'>...some text...</span>
 *     </span>
 * </code>
 *
 * @category Components
 */
export class Label<Config extends LabelConfig> extends Component<Config> {
  private text: LocalizableText;
  private textElement: DOM | null = null;

  private labelEvents = {
    onClick: new EventDispatcher<Label<Config>, NoArgs>(),
    onTextChanged: new EventDispatcher<Label<Config>, string>(),
  };

  constructor(config: Config = {} as Config) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-label',
        labelStyle: LabelStyle.Text,
      } as Config,
      this.config,
    );
    this.text = this.config.text;
  }

  protected toDomElement(): DOM {
    const tagName = this.config.for != null ? 'label' : 'span';
    const textElement = new DOM(
      'span',
      {
        class: this.prefixCss('ui-label-text'),
      },
      this,
    ).html(i18n.performLocalization(this.text));
    this.textElement = textElement;

    const wrapperElement = new DOM(
      tagName,
      {
        id: this.config.id,
        for: this.config.for,
        class: this.getCssClasses(),
        tabindex: this.config.tabIndex.toString(),
      },
      this,
    );
    wrapperElement.append(textElement);
    wrapperElement.on('click', () => {
      this.onClickEvent();
    });

    if (this.config.labelStyle !== LabelStyle.Text) {
      const icon = new Icon();
      switch (this.config.labelStyle) {
        case LabelStyle.TextWithTrailingIcon:
          wrapperElement.append(icon.getDomElement());
          break;
        case LabelStyle.TextWithLeadingIcon:
          wrapperElement.prepend(icon.getDomElement());
          break;
      }
    }

    return wrapperElement;
  }

  /**
   * Set the text on this label.
   * @param text
   */
  setText(text: LocalizableText) {
    if (text === this.text && typeof text !== 'function') {
      return;
    }

    this.text = text;
    const localizedText = i18n.performLocalization(text);
    this.textElement?.html(i18n.performLocalization(text));
    this.onTextChangedEvent(localizedText);
  }

  /**
   * Gets the text on this label.
   * @return {string} The text on the label
   */
  getText(): string {
    return i18n.performLocalization(this.text);
  }

  /**
   * Clears the text on this label.
   */
  clearText() {
    this.textElement?.html('');
    this.onTextChangedEvent(null);
  }

  /**
   * Tests if the label is empty and does not contain any text.
   * @return {boolean} True if the label is empty, else false
   */
  isEmpty(): boolean {
    return !this.text;
  }

  /**
   * Fires the {@link #onClick} event.
   * Can be used by subclasses to listen to this event without subscribing an event listener by overwriting the method
   * and calling the super method.
   */
  protected onClickEvent() {
    this.labelEvents.onClick.dispatch(this);
  }

  /**
   * Fires the {@link #onClick} event.
   * Can be used by subclasses to listen to this event without subscribing an event listener by overwriting the method
   * and calling the super method.
   */
  protected onTextChangedEvent(text: string) {
    this.labelEvents.onTextChanged.dispatch(this, text);
  }

  /**
   * Gets the event that is fired when the label is clicked.
   * @returns {Event<Label<LabelConfig>, NoArgs>}
   */
  get onClick(): Event<Label<LabelConfig>, NoArgs> {
    return this.labelEvents.onClick.getEvent();
  }

  /**
   * Gets the event that is fired when the text on the label is changed.
   * @returns {Event<Label<LabelConfig>, string>}
   */
  get onTextChanged(): Event<Label<LabelConfig>, string> {
    return this.labelEvents.onTextChanged.getEvent();
  }

  protected onUpdated(sender: UIManager): void {
    // updating the text if it's not a (localization) function can lead to
    // hardcoded default strings sometimes overwriting the actual value
    if (typeof this.config.text === 'function') {
      this.setText(this.config.text);
    }
  }
}
