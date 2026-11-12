import { StatusAnnouncer } from '../../src/ts/utils/StatusAnnouncer';

describe('StatusAnnouncer', () => {
  let announcer: StatusAnnouncer;
  let region: HTMLElement;

  beforeEach(() => {
    jest.useFakeTimers();
    announcer = new StatusAnnouncer();
    region = announcer.getDomElement().get(0) as HTMLElement;
    document.body.appendChild(region);
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

  it('should drop pending messages and remove the region on release', () => {
    announcer.announce('Buffering');

    announcer.release();
    jest.advanceTimersByTime(StatusAnnouncer.ANNOUNCE_DELAY_MS);

    expect(region.textContent).toBe('');
    expect(region.parentNode).toBeNull();
  });
});
