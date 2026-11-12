import { ClickThroughUtils } from '../../src/ts/utils/ClickThroughUtils';

describe('ClickThroughUtils', () => {
  let windowOpen: jest.SpyInstance;

  beforeEach(() => {
    windowOpen = jest.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => {
    windowOpen.mockRestore();
  });

  const pageUrl = window.location.href;

  it.each([
    ['https://example.com/ad', 'https://example.com/ad'],
    ['http://example.com/ad', 'http://example.com/ad'],
    ['HTTPS://Example.com/ad', 'https://example.com/ad'],
    ['  https://example.com/ad\n', 'https://example.com/ad'],
    ['/landing?id=1', new URL('/landing?id=1', pageUrl).href],
    ['landing', new URL('landing', pageUrl).href],
  ])('should open the http(s) click-through %p as %p in a new tab without opener or referrer', (url, expectedUrl) => {
    expect(ClickThroughUtils.getSafeUrl(url)).toBe(expectedUrl);

    expect(ClickThroughUtils.open(url)).toBe(true);

    expect(windowOpen).toHaveBeenCalledTimes(1);
    expect(windowOpen).toHaveBeenCalledWith(expectedUrl, '_blank', 'noopener,noreferrer');
  });

  it.each([
    ['javascript:void(opener.__xss=document.domain)'],
    ['JavaScript:alert(1)'],
    ['  javascript:alert(1)'],
    ['java\tscript:alert(1)'],
    ['\njavascript:alert(1)'],
    ['data:text/html,<script>alert(1)</script>'],
    ['vbscript:msgbox(1)'],
    ['file:///etc/passwd'],
    ['ftp://example.com/ad'],
    [''],
    ['   '],
    [null],
    [undefined],
  ])('should not open the click-through %p', url => {
    expect(ClickThroughUtils.getSafeUrl(url)).toBeUndefined();

    expect(ClickThroughUtils.open(url)).toBe(false);

    expect(windowOpen).not.toHaveBeenCalled();
  });

  describe('on engines that ignore the noopener feature', () => {
    it('should clear the opener of the returned window', () => {
      const openedWindow = { opener: window } as unknown as Window;
      windowOpen.mockImplementation(() => openedWindow);

      expect(ClickThroughUtils.open('https://example.com/ad')).toBe(true);

      expect(openedWindow.opener).toBeNull();
    });

    it('should still report the click-through as opened when the opener cannot be cleared', () => {
      const openedWindow = {} as Window;
      Object.defineProperty(openedWindow, 'opener', {
        get: () => window,
        set: () => {
          throw new Error('opener is read-only');
        },
      });
      windowOpen.mockImplementation(() => openedWindow);

      expect(ClickThroughUtils.open('https://example.com/ad')).toBe(true);

      expect(windowOpen).toHaveBeenCalledWith('https://example.com/ad', '_blank', 'noopener,noreferrer');
    });
  });

  it('should report the click-through as opened when window.open returns no window', () => {
    expect(ClickThroughUtils.open('https://example.com/ad')).toBe(true);

    expect(windowOpen).toHaveReturnedWith(null);
  });
});
