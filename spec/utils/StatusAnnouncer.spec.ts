import { StatusAnnouncer } from '../../src/ts/utils/StatusAnnouncer';

describe('StatusAnnouncer', () => {
  let announcer: StatusAnnouncer;
  let region: HTMLElement;
  let alertRegion: HTMLElement;

  beforeEach(() => {
    jest.useFakeTimers();
    announcer = new StatusAnnouncer();
    [region, alertRegion] = announcer.getDomElement().get() as HTMLElement[];
    document.body.append(region, alertRegion);
  });

  afterEach(() => {
    announcer.release();
    jest.useRealTimers();
  });

  it('should create one empty polite atomic status region', () => {
    expect(region.getAttribute('role')).toBe('status');
    expect(region.getAttribute('aria-live')).toBe('polite');
    expect(region.getAttribute('aria-atomic')).toBe('true');
    expect(region.textContent).toBe('');
  });

  it('should create one empty assertive alert region next to it', () => {
    expect(alertRegion.getAttribute('role')).toBe('alert');
    // Implicitly assertive; an explicit aria-live makes iOS VoiceOver read alerts twice
    expect(alertRegion.hasAttribute('aria-live')).toBe(false);
    expect(alertRegion.getAttribute('aria-atomic')).toBe('true');
    expect(alertRegion.textContent).toBe('');
  });

  it('should write assertive messages to the alert region only', () => {
    announcer.announce('Error is unknown', { assertive: true });
    jest.advanceTimersByTime(StatusAnnouncer.ANNOUNCE_DELAY_MS);

    expect(alertRegion.textContent).toBe('Error is unknown');
    expect(region.textContent).toBe('');
  });

  it('should announce a second, different alert', () => {
    announcer.announce('Error is unknown', { assertive: true });
    jest.advanceTimersByTime(StatusAnnouncer.ANNOUNCE_DELAY_MS);

    announcer.announce('General setup error', { assertive: true });

    expect(alertRegion.textContent).toBe('');
    jest.advanceTimersByTime(StatusAnnouncer.ANNOUNCE_DELAY_MS);
    expect(alertRegion.textContent).toBe('General setup error');
  });

  describe('once per subject', () => {
    let regionAnnounce: jest.SpyInstance;
    const announceAdStarted = (subject: unknown) =>
      announcer.announce('Ad started', { oncePer: { topic: 'adStarted', subject } });

    beforeEach(() => {
      regionAnnounce = jest.spyOn(announcer['statusRegion'], 'announce');
    });

    it('should not announce the same subject twice for a topic', () => {
      announceAdStarted('ad-1');
      announceAdStarted('ad-1');

      expect(regionAnnounce).toHaveBeenCalledTimes(1);
    });

    it.each([
      ['a different subject', 'ad-2', 'adStarted'],
      ['the same subject for a different topic', 'ad-1', 'adSkippable'],
    ])('should announce %s', (_, subject, topic) => {
      announceAdStarted('ad-1');
      announcer.announce('message', { oncePer: { topic, subject } });

      expect(regionAnnounce).toHaveBeenCalledTimes(2);
    });

    it('should not announce the same subject twice for a topic named like an Object.prototype member', () => {
      announcer.announce('message', { oncePer: { topic: '__proto__', subject: 'ad-1' } });
      announcer.announce('message', { oncePer: { topic: '__proto__', subject: 'ad-1' } });

      expect(regionAnnounce).toHaveBeenCalledTimes(1);
    });

    it('should announce a subject again after forgetting only its topic', () => {
      announceAdStarted('ad-1');
      announcer.announce('message', { oncePer: { topic: 'adSkippable', subject: 'ad-1' } });

      announcer.forgetAnnounced('adStarted');
      announceAdStarted('ad-1');
      announcer.announce('message', { oncePer: { topic: 'adSkippable', subject: 'ad-1' } });

      expect(regionAnnounce).toHaveBeenCalledTimes(3);
    });

    it('should announce a subject again after forgetting announced subjects', () => {
      announceAdStarted('ad-1');
      announcer.forgetAnnouncedSubjects();
      announceAdStarted('ad-1');

      expect(regionAnnounce).toHaveBeenCalledTimes(2);
    });
  });

  it('should clear the region first and write the message after a delay', () => {
    announcer.announce('Buffering');

    expect(region.textContent).toBe('');

    jest.advanceTimersByTime(StatusAnnouncer.ANNOUNCE_DELAY_MS);

    expect(region.textContent).toBe('Buffering');
  });

  it('should announce a repeated identical message again by clearing the region in between', () => {
    announcer.announce('Buffering');
    jest.advanceTimersByTime(StatusAnnouncer.ANNOUNCE_DELAY_MS);

    announcer.announce('Buffering');

    expect(region.textContent).toBe('');
    jest.advanceTimersByTime(StatusAnnouncer.ANNOUNCE_DELAY_MS);
    expect(region.textContent).toBe('Buffering');
  });

  it('should announce messages that arrive together at once and drop identical duplicates', () => {
    announcer.announce('Ad started');
    announcer.announce('Ad started');
    announcer.announce('You can skip the ad now');

    jest.advanceTimersByTime(StatusAnnouncer.ANNOUNCE_DELAY_MS);

    expect(region.textContent).toBe('Ad started You can skip the ad now');
  });

  it('should clear the message after it has been announced', () => {
    announcer.announce('Playback finished');
    jest.advanceTimersByTime(StatusAnnouncer.ANNOUNCE_DELAY_MS);

    jest.advanceTimersByTime(StatusAnnouncer.CLEAR_DELAY_MS);

    expect(region.textContent).toBe('');
  });

  it.each(['', '   ', null, undefined])('should ignore the empty message %p', message => {
    announcer.announce(message as string);
    jest.advanceTimersByTime(StatusAnnouncer.ANNOUNCE_DELAY_MS);

    expect(region.textContent).toBe('');
  });

  it('should write messages as text instead of markup', () => {
    announcer.announce('Casting to <img src=x onerror=alert(1)>');
    jest.advanceTimersByTime(StatusAnnouncer.ANNOUNCE_DELAY_MS);

    expect(region.children).toHaveLength(0);
    expect(region.textContent).toBe('Casting to <img src=x onerror=alert(1)>');
  });

  it('should drop pending messages and remove both regions on release', () => {
    announcer.announce('Buffering');
    announcer.announce('Error is unknown', { assertive: true });

    announcer.release();
    jest.advanceTimersByTime(StatusAnnouncer.ANNOUNCE_DELAY_MS);

    expect(region.textContent).toBe('');
    expect(alertRegion.textContent).toBe('');
    expect(region.parentNode).toBeNull();
    expect(alertRegion.parentNode).toBeNull();
  });
});
