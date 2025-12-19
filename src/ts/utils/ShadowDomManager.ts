import { DOM } from '../DOM';
import { ShadowDomConfig } from '../UIConfig';
import { prefixCss } from '../components/DummyComponent';

/**
 * Encapsulates Shadow DOM initialization.
 */
export class ShadowDomManager {
  private static readonly DEFAULT_SHADOW_STYLESHEET_NAME = '{{FILENAME}}';

  // The ShadowRoot element where the UI is rendered into
  private shadowRoot?: ShadowRoot;

  // The wrapper element in which the ShadowRoot is rendered into.
  // This is needed to have a proper way to destroy the ShadowRoot on release.
  private shadowHost?: DOM;

  public static isShadowDomSupported(): boolean {
    return (
      typeof ShadowRoot !== 'undefined' &&
      typeof HTMLElement !== 'undefined' &&
      typeof HTMLElement.prototype.attachShadow === 'function'
    );
  }

  initialize(containerElement: DOM, shadowDomConfig: ShadowDomConfig) {
    if (!ShadowDomManager.isShadowDomSupported()) {
      return;
    }

    const shadowHost = new DOM('div', {
      class: prefixCss('shadow-dom-container'),
    });

    shadowHost.css({
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
    });

    containerElement.append(shadowHost);

    this.shadowHost = shadowHost;
    this.shadowRoot = shadowHost.get(0).attachShadow({ mode: 'open' });

    this.injectStyles(shadowDomConfig);
  }

  getShadowRoot(): ShadowRoot | undefined {
    return this.shadowRoot;
  }

  release(): void {
    if (this.shadowHost) {
      this.shadowHost.remove();
      this.shadowHost = undefined;
      this.shadowRoot = undefined;
    }
  }

  /**
   * Looks for existing stylesheets on the document for the given names and injects them into the ShadowRoot to include
   * default UI styles (and custom additional styles).
   */
  private injectStyles(shadowDomConfig: ShadowDomConfig): void {
    if (!this.shadowRoot) {
      return;
    }

    const stylesheetName = shadowDomConfig.uiStylesheet || ShadowDomManager.DEFAULT_SHADOW_STYLESHEET_NAME;
    const mainHref = resolveStylesheetHref(stylesheetName);

    if (mainHref) {
      appendStylesheet(this.shadowRoot, mainHref);
    } else {
      console.warn(
        'Shadow DOM is enabled but no stylesheet was found. ' +
          'Provide `uiStylesheet` (URL or filename) or include {{FILENAME}} on the page.',
      );
    }

    // Inject additional stylesheets
    if (shadowDomConfig.additionalStylesheets && shadowDomConfig.additionalStylesheets.length > 0) {
      shadowDomConfig.additionalStylesheets.forEach(stylesheetName => {
        const href = resolveStylesheetHref(stylesheetName);
        if (href) {
          appendStylesheet(this.shadowRoot!, href);
        } else {
          console.warn(
            `Shadow DOM: Could not resolve additional stylesheet '${stylesheetName}'. ` +
              'Check the URL or ensure the stylesheet is linked on the page.',
          );
        }
      });
    }
  }
}

function resolveStylesheetHref(stylesheetName: string): string | null {
  const isUrl =
    /^https?:\/\//.test(stylesheetName) ||
    stylesheetName.startsWith('/') ||
    stylesheetName.startsWith('./') ||
    stylesheetName.startsWith('../');

  if (isUrl) {
    return stylesheetName;
  }

  // Search for filename/substring in existing stylesheets
  const stylesheetLinks = Array.from(document.querySelectorAll('link[rel~="stylesheet"]')) as HTMLLinkElement[];

  const matchingLink = stylesheetLinks.find(link => link.href && link.href.indexOf(stylesheetName) !== -1);
  return matchingLink?.href || null;
}

function appendStylesheet(shadowRoot: ShadowRoot, href: string): void {
  const linkElement = document.createElement('link');
  linkElement.rel = 'stylesheet';
  linkElement.href = href;
  shadowRoot.appendChild(linkElement);
}
