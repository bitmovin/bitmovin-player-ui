import { DOM } from '../DOM';
import { Timeout } from './Timeout';

/**
 * Owns the single, visually hidden, polite live region of a {@link UIManager} and announces status messages
 * (WCAG 4.1.3 Status Messages) through it.
 *
 * The region is created once per UI manager and lives next to the UI variants, so it is in the accessibility tree
 * before the first message and survives UI variant switches (e.g. into the ads UI) that happen together with the
 * status change being announced.
 *
 * @hidden
 */
export class StatusAnnouncer {
  /**
   * Delay between clearing the region and writing the message. Screen readers only announce a live region when
   * its content changes, so the region is emptied first and filled in a later task. This also makes a repeated
   * identical message announce again.
   */
  static readonly ANNOUNCE_DELAY_MS = 100;
  /**
   * Time after which the message is removed again, so a screen reader user browsing the page later does not come
   * across a stale status.
   */
  static readonly CLEAR_DELAY_MS = 5000;

  private readonly element: HTMLElement;
  private readonly announceTimeout: Timeout;
  private readonly clearTextTimeout: Timeout;
  private pendingMessages: string[] = [];

  constructor() {
    this.element = document.createElement('div');
    this.element.className = '{{PREFIX}}-ui-status-announcer';
    this.element.setAttribute('role', 'status');
    this.element.setAttribute('aria-live', 'polite');
    this.element.setAttribute('aria-atomic', 'true');

    this.announceTimeout = new Timeout(StatusAnnouncer.ANNOUNCE_DELAY_MS, this.flush);
    this.clearTextTimeout = new Timeout(StatusAnnouncer.CLEAR_DELAY_MS, this.clearText);
  }

  /**
   * Returns the live region element, which the owner has to attach to the DOM before the first announcement.
   */
  getDomElement(): DOM {
    return new DOM(this.element);
  }

  /**
   * Queues a plain-text message for announcement. Messages that arrive within {@link ANNOUNCE_DELAY_MS} of each
   * other are announced together, and identical messages within that window are announced once.
   */
  announce(message: string): void {
    const trimmedMessage = message == null ? '' : String(message).trim();
    if (trimmedMessage === '') {
      return;
    }

    if (this.pendingMessages.indexOf(trimmedMessage) === -1) {
      this.pendingMessages.push(trimmedMessage);
    }

    this.clearTextTimeout.clear();
    this.clearText();
    if (!this.announceTimeout.isActive()) {
      this.announceTimeout.start();
    }
  }

  release(): void {
    this.announceTimeout.clear();
    this.clearTextTimeout.clear();
    this.pendingMessages = [];
    this.clearText();
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  private readonly flush = (): void => {
    // textContent, never innerHTML: messages can contain player or integrator supplied text such as device names.
    this.element.textContent = this.pendingMessages.join(' ');
    this.pendingMessages = [];
    this.clearTextTimeout.start();
  };

  private readonly clearText = (): void => {
    this.element.textContent = '';
  };
}
