import { ClickOverlay } from '../../../src/ts/components/overlays/ClickOverlay';

describe('ClickOverlay', () => {
  let windowOpen: jest.SpyInstance;

  beforeEach(() => {
    windowOpen = jest.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => {
    windowOpen.mockRestore();
  });

  function click(url: string): void {
    const clickOverlay = new ClickOverlay();
    clickOverlay.initialize();
    clickOverlay.setUrl(url);
    clickOverlay.getDomElement().get(0).click();
  }

  it.each(['https://example.com/ad', 'http://example.com/ad'])(
    'should open %p in a new tab without opener or referrer',
    url => {
      click(url);

      expect(windowOpen).toHaveBeenCalledTimes(1);
      expect(windowOpen).toHaveBeenCalledWith(url, '_blank', 'noopener,noreferrer');
    },
  );

  it.each(['javascript:void(opener.__xss=document.domain)', 'data:text/html,<script>alert(1)</script>', ''])(
    'should not open %p',
    url => {
      click(url);

      expect(windowOpen).not.toHaveBeenCalled();
    },
  );
});
