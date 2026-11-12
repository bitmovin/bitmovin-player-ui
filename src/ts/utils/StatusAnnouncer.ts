import { DOM } from '../DOM';
import { Timeout } from './Timeout';

/**
 * Options for {@link UIInstanceManager.announce} and {@link UIManager.announce}.
 *
 * @category Utils
 */
export interface AnnounceOptions {
  /**
   * Announce through the assertive alert region instead of the polite status region. Screen readers interrupt
   * what they are reading for it, so reserve it for errors that stop playback.
   * Default: false
   */
  assertive?: boolean;
  /**
   * Announce the message only once per `subject` for this `topic`, e.g. once per ad. Use it for status that the UI
   * can receive more than once for the same subject, such as the start of the current ad, which is replayed into a
   * UI variant that becomes active during the ad. Only the latest subject per topic is remembered, and all are
   * forgotten when an ad break finishes or the source is unloaded.
   */
  oncePer?: {
    topic: string;
    subject: unknown;
  };
}

/**
 * One visually hidden live region. Screen readers only announce a live region when its content changes, so it is
 * emptied first and filled in a later task, which also makes a repeated identical message announce again.
 */
class LiveRegion {
  readonly element: HTMLElement;
  private readonly writeTimeout: Timeout;
  private readonly clearTextTimeout: Timeout;
  private pendingMessages: string[] = [];

  constructor(role: 'status' | 'alert', politeness: 'polite' | 'assertive') {
    this.element = document.createElement('div');
    this.element.className = '{{PREFIX}}-ui-status-announcer';
    this.element.setAttribute('role', role);
    this.element.setAttribute('aria-live', politeness);
    this.element.setAttribute('aria-atomic', 'true');

    this.writeTimeout = new Timeout(StatusAnnouncer.ANNOUNCE_DELAY_MS, this.flush);
    this.clearTextTimeout = new Timeout(StatusAnnouncer.CLEAR_DELAY_MS, this.clearText);
  }

  announce(message: string): void {
    if (this.pendingMessages.indexOf(message) === -1) {
      this.pendingMessages.push(message);
    }

    this.clearTextTimeout.clear();
    this.clearText();
    if (!this.writeTimeout.isActive()) {
      this.writeTimeout.start();
    }
  }

  release(): void {
    this.writeTimeout.clear();
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

/**
 * Owns the visually hidden live regions of a {@link UIManager} and announces status messages through them
 * (WCAG 4.1.3 Status Messages): a polite `status` region for status changes and an assertive `alert` region for
 * errors.
 *
 * The regions are created once per UI manager and live next to the UI variants, so they are in the accessibility
 * tree and empty before the first message, and survive UI variant switches (e.g. into the ads UI) that happen
 * together with the status change being announced.
 *
 * @hidden
 */
export class StatusAnnouncer {
  /** Delay between emptying a region and writing the message. */
  static readonly ANNOUNCE_DELAY_MS = 100;
  /**
   * Time after which a message is removed again, so a screen reader user browsing the page later does not come
   * across a stale status.
   */
  static readonly CLEAR_DELAY_MS = 5000;

  private readonly statusRegion = new LiveRegion('status', 'polite');
  private readonly alertRegion = new LiveRegion('alert', 'assertive');
  private announcedSubjects: { [topic: string]: unknown } = {};

  /**
   * Returns both live regions, which the owner has to attach to the DOM before the first announcement.
   */
  getDomElement(): DOM {
    return new DOM([this.statusRegion.element, this.alertRegion.element]);
  }

  /**
   * Queues a plain-text message for announcement. Messages for the same region that arrive within
   * {@link ANNOUNCE_DELAY_MS} of each other are announced together, and identical ones once.
   */
  announce(message: string, options: AnnounceOptions = {}): void {
    const trimmedMessage = message == null ? '' : String(message).trim();
    if (trimmedMessage === '') {
      return;
    }

    const oncePer = options.oncePer;
    if (oncePer) {
      if (
        Object.prototype.hasOwnProperty.call(this.announcedSubjects, oncePer.topic) &&
        this.announcedSubjects[oncePer.topic] === oncePer.subject
      ) {
        return;
      }
      this.announcedSubjects[oncePer.topic] = oncePer.subject;
    }

    (options.assertive ? this.alertRegion : this.statusRegion).announce(trimmedMessage);
  }

  /**
   * Forgets the subjects remembered for {@link AnnounceOptions.oncePer}, so they are announced again.
   */
  forgetAnnouncedSubjects(): void {
    this.announcedSubjects = {};
  }

  release(): void {
    this.statusRegion.release();
    this.alertRegion.release();
    this.forgetAnnouncedSubjects();
  }
}
