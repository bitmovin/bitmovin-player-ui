import { BrowserUtils } from '../src/ts/browserutils';

const mobileSafariUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A356 Safari/604.1';

declare const global: any;

describe('BrowserUtils', () => {
  beforeEach(() => {
    Object.defineProperty(global.navigator, 'userAgent', {
      get() {
        return mobileSafariUserAgent;
      },
      configurable: true,
    });
  });

  afterEach(() => {
    delete global.navigator.userAgent;
  });

  describe('isMobile', () => {
    it('detects mobile if user agent contains Mobi', () => {
      expect(BrowserUtils.isMobile).toBeTruthy();
    });
  });
});
