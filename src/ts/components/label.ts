import {ComponentConfig, Component} from './component';
import {DOM} from '../dom';
import {EventDispatcher, Event, NoArgs} from '../eventdispatcher';
import i18n from '../localization/i18n';

/**
 * Configuration interface for a {@link Label} component.
 */
export interface LabelConfig extends ComponentConfig {
  /**
   * The text on the label.
   */
  text?: string;
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

  private text: string;

  private labelEvents = {
    onClick: new EventDispatcher<Label<Config>, NoArgs>(),
    onTextChanged: new EventDispatcher<Label<Config>, string>(),
  };

  constructor(config: Config = {} as Config) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-label',
    } as Config, this.config);
    /**
     * @todo(cagin): open question:
     * is it better to localize in `constructor` in `configure` or in `toDomElement`
     * what is the difference there ?
     * my preference was to make it in toDomElement(). are there any pitfalls that I don't see`
     */
    this.text = this.config.text;
  }

  protected toDomElement(): DOM {
    let labelElement = new DOM('span', {
      'id': this.config.id,
      'class': this.getCssClasses(),
    }).html(i18n.t(this.text));

    labelElement.on('click', () => {
      this.onClickEvent();
    });

    return labelElement;
  }

  /**
   * Set the text on this label.
   * @param text
   */
  setText(text: string) {
    if (text === this.text) {
      return;
    }

    this.text = text;
    this.getDomElement().html(text);
    this.onTextChangedEvent(text);
  }

  /**
   * Gets the text on this label.
   * @return {string} The text on the label
   */
  getText(): string {
    return this.text;
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
