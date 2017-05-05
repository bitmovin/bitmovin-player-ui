import {ComponentConfig, Component} from './component';
import {DOM} from '../dom';
import {EventDispatcher, Event, NoArgs} from '../eventdispatcher';

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
export class Label<Config extends LabelConfig> extends Component<LabelConfig> {

  private text: string;

  private labelEvents = {
    onClick: new EventDispatcher<Label<Config>, NoArgs>()
  };

  constructor(config: LabelConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-label'
    }, this.config);

    this.text = this.config.text;
  }

  protected toDomElement(): DOM {
    let labelElement = new DOM('span', {
      'id': this.config.id,
      'class': this.getCssClasses()
    }).html(this.text);

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
    this.text = text;
    this.getDomElement().html(text);
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
  }

  protected onClickEvent() {
    this.labelEvents.onClick.dispatch(this);
  }

  /**
   * Gets the event that is fired when the label is clicked.
   * @returns {Event<Label<LabelConfig>, NoArgs>}
   */
  get onClick(): Event<Label<LabelConfig>, NoArgs> {
    return this.labelEvents.onClick.getEvent();
  }
}