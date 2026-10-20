import { DOM } from '../../../DOM';
import { EventDispatcher } from '../../../EventDispatcher';
import { Component, ComponentConfig } from '../../Component';
import { formatPlayheadTime } from './GraphCanvas';

/**
 * A range input over a recording, so a view that stands still can be moved through all of it.
 * ←/→ move five seconds, Shift+←/→ one, Home/End jump to the ends.
 */
export class PlayerGraphsScrubber extends Component<ComponentConfig> {
  readonly onScrub = new EventDispatcher<PlayerGraphsScrubber, number>();
  private start = 0;
  private end = 0;

  constructor(config: ComponentConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, { cssClass: 'ui-player-graphs-panel-scrubber' }, this.config);
  }

  protected toDomElement(): DOM {
    const input = new DOM('input', {
      type: 'range',
      min: '0',
      max: '0',
      step: '0.01',
      value: '0',
      'aria-label': 'View position',
    });
    const readout = new DOM('span', { class: this.prefixCss('ui-player-graphs-panel-scrubber-readout') });

    input.on('input', () => this.scrubTo(parseFloat(input.val())));
    input.on('keydown', (event: KeyboardEvent) => {
      const step = event.shiftKey ? 1 : 5;
      const targets: Record<string, number> = {
        ArrowLeft: this.value() - step,
        ArrowRight: this.value() + step,
        Home: this.start,
        End: this.end,
      };
      if (event.key in targets) {
        event.preventDefault();
        this.scrubTo(targets[event.key]);
      }
    });

    return new DOM('div', { class: this.getCssClasses() }, this).append(input, readout);
  }

  setRange(start: number, end: number, value: number): void {
    this.start = Math.min(start, end);
    this.end = Math.max(start, end);
    this.input().min = String(this.start);
    this.input().max = String(this.end);
    this.setValue(value);
  }

  private setValue(value: number): void {
    const clamped = Math.min(this.end, Math.max(this.start, value));
    this.input().value = String(clamped);
    this.getDomElement()
      .find('span')
      .html(
        `${formatPlayheadTime(clamped, true)} · ${formatPlayheadTime(this.start, true)} – ${formatPlayheadTime(this.end, true)}`,
      );
  }

  private scrubTo(value: number): void {
    if (Number.isFinite(value)) {
      this.setValue(value);
      this.onScrub.dispatch(this, this.value());
    }
  }

  private value(): number {
    return parseFloat(this.input().value);
  }

  // Looked up rather than kept in a field: the base constructor builds the element before field initializers run.
  private input(): HTMLInputElement {
    return this.getDomElement().get(0).querySelector('input');
  }
}
