import {ComponentConfig, Component} from './component';
import {DOM} from '../dom';
import {EventDispatcher, Event, NoArgs} from '../eventdispatcher';
import { LocalizableText, i18n } from '../localization/i18n';

/**
 * Configuration interface for a {@link Label} component.
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
}

/**
 * A simple text label.
 *
 * DOM example:
 * <code>
 *     <span class='ui-label'>...some text...</span>
 * </code>
 */
export class Label<Config extends LabelConfig> extends Component<Config> {

  private text: LocalizableText;

  private labelEvents = {
    onClick: new EventDispatcher<Label<Config>, NoArgs>(),
    onTextChanged: new EventDispatcher<Label<Config>, string>(),
  };

  constructor(config: Config = {} as Config) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-label',
    } as Config, this.config);
    this.text = this.config.text;
  }

  protected toDomElement(): DOM {
    const tagName = this.config.for != null ? 'label' : 'span';

    let labelElement = new DOM(tagName, {
      'id': this.config.id,
      'for': this.config.for,
      'class': this.getCssClasses(),
    }).html(i18n.performLocalization(this.text));

    labelElement.on('click', () => {
      this.onClickEvent();
    });

    return labelElement;
  }

  /**
   * Set the text on this label.
   * @param text
   */
  setText(text: LocalizableText) {
    if (text === this.text) {
      return;
    }

    this.text = text;
    const localizedText = i18n.performLocalization(text);
    this.getDomElement().html(localizedText);
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
    this.getDomElement().html('');
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
}
