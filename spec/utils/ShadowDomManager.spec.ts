import { ShadowDomManager } from '../../src/ts/utils/ShadowDomManager';
import { ShadowDomConfig } from '../../src/ts/UIConfig';
import { DOM } from '../../src/ts/DOM';

describe('ShadowDomManager', () => {
  const appendLink = (href: string) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
    return link;
  };

  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  describe('isShadowDomSupported', () => {
    it('returns true when attachShadow is available', () => {
      expect(ShadowDomManager.isShadowDomSupported()).toBe(true);
    });

    it('returns false and warns when Shadow DOM APIs are missing', () => {
      const originalAttachShadow = (HTMLElement.prototype as any).attachShadow;
      const originalShadowRoot = (global as any).ShadowRoot;
      delete (HTMLElement.prototype as any).attachShadow;
      (global as any).ShadowRoot = undefined;

      expect(ShadowDomManager.isShadowDomSupported()).toBe(false);

      if (originalAttachShadow) {
        (HTMLElement.prototype as any).attachShadow = originalAttachShadow;
      }
      (global as any).ShadowRoot = originalShadowRoot;
    });
  });

  describe('initialize', () => {
    let manager: ShadowDomManager;
    let container: DOM;

    beforeEach(() => {
      manager = new ShadowDomManager();
      container = new DOM('div', {});
      document.body.appendChild(container.get(0));
    });

    it('attaches a shadow root and injects main stylesheet by filename', () => {
      appendLink('https://cdn.example.com/bitmovinplayer-ui.css');
      const config: ShadowDomConfig = { enabled: true, uiStylesheetName: 'bitmovinplayer-ui' };

      manager.initialize(container, config);

      const shadowRoot = manager.getShadowRoot();
      expect(shadowRoot).toBeDefined();
      const links = shadowRoot.querySelectorAll('link[rel="stylesheet"]');
      expect(links.length).toBe(1);
      expect((links[0] as HTMLLinkElement).href).toContain('bitmovinplayer-ui');
    });

    it('injects additional stylesheets', () => {
      appendLink('https://cdn.example.com/bitmovinplayer-ui.css');
      const config: ShadowDomConfig = {
        enabled: true,
        uiStylesheetName: 'bitmovinplayer-ui',
        additionalStylesheets: ['https://cdn.example.com/custom.css', 'other.css'],
      };
      appendLink('https://example.com/other.css');

      manager.initialize(container, config);

      const links = manager.getShadowRoot().querySelectorAll('link[rel="stylesheet"]');
      const hrefs = Array.from(links).map(link => (link as HTMLLinkElement).href);
      expect(hrefs).toEqual(
        expect.arrayContaining([
          expect.stringContaining('bitmovinplayer-ui.css'),
          'https://cdn.example.com/custom.css',
          expect.stringContaining('other.css'),
        ]),
      );
    });

    it('releases host and shadow root', () => {
      appendLink('https://cdn.example.com/bitmovinplayer-ui.css');
      manager.initialize(container, { enabled: true, uiStylesheetName: 'bitmovinplayer-ui' });

      manager.release();

      expect(manager.getShadowRoot()).toBeUndefined();
    });
  });
});
