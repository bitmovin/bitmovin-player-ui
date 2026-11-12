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
   * UI variant that becomes active during the ad. Only the latest subject per topic is remembered. All are
   * forgotten when an ad break finishes or the source is unloaded, and a single topic with
   * {@link UIInstanceManager.forgetAnnounced}.
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
  private readonly getLanguage: () => string | undefined;
  private pendingMessages: string[] = [];

  constructor(role: 'status' | 'alert', getLanguage: () => string | undefined) {
    this.getLanguage = getLanguage;
    this.element = document.createElement('div');
    this.element.className = '{{PREFIX}}-ui-status-announcer';
    this.element.setAttribute('role', role);
    // `alert` is implicitly assertive. Adding aria-live="assertive" to it makes iOS VoiceOver read it twice.
    if (role === 'status') {
      this.element.setAttribute('aria-live', 'polite');
    }
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
    // The region is outside the UI, so it does not inherit the language of the UI that localized the message
    const language = this.getLanguage();
    if (language) {
      this.element.setAttribute('lang', language);
    } else {
      this.element.removeAttribute('lang');
    }
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

  private readonly statusRegion: LiveRegion;
  private readonly alertRegion: LiveRegion;
  // A Map, so a topic can never collide with an Object.prototype member such as `__proto__`
  private readonly announcedSubjects = new Map<string, unknown>();

  /**
   * @param getLanguage returns the language of the UI that localizes the messages. The regions live outside that UI,
   *   so each message marks its region with this language for screen readers to pronounce it correctly (WCAG 3.1.2).
   *   Without a language the regions inherit the language of the page.
   */
  constructor(getLanguage: () => string | undefined = () => undefined) {
    this.statusRegion = new LiveRegion('status', getLanguage);
    this.alertRegion = new LiveRegion('alert', getLanguage);
  }

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
      if (this.announcedSubjects.has(oncePer.topic) && this.announcedSubjects.get(oncePer.topic) === oncePer.subject) {
        return;
      }
      this.announcedSubjects.set(oncePer.topic, oncePer.subject);
    }

    (options.assertive ? this.alertRegion : this.statusRegion).announce(trimmedMessage);
  }

  /**
   * Forgets the subjects remembered for {@link AnnounceOptions.oncePer}, so they are announced again.
   */
  forgetAnnouncedSubjects(): void {
    this.announcedSubjects.clear();
  }

  /**
   * Forgets the subject remembered for one {@link AnnounceOptions.oncePer} topic, so it is announced again.
   */
  forgetAnnounced(topic: string): void {
    this.announcedSubjects.delete(topic);
  }

  release(): void {
    this.statusRegion.release();
    this.alertRegion.release();
    this.forgetAnnouncedSubjects();
  }
}
