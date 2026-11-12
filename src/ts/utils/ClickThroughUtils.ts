const SAFE_CLICK_THROUGH_PROTOCOLS = ['http:', 'https:'];

/**
 * Click-through URLs come from ad responses and other third-party content. Only http and https destinations are
 * opened: other schemes, such as `javascript:` or `data:`, would run or render with access to the player page.
 */
export namespace ClickThroughUtils {
  /**
   * Resolves a click-through URL against the page and returns the resolved URL when it is an http or https URL.
   * Returns `undefined` for any other scheme and for an empty URL.
   */
  export function getSafeUrl(url: string | null | undefined): string | undefined {
    // An empty URL would resolve to the page itself.
    if (typeof url !== 'string' || url.trim() === '') {
      return undefined;
    }

    // An anchor resolves and normalizes the URL the way a navigation would, e.g. it strips surrounding whitespace and
    // lowercases the scheme, and it also works on platforms without the `URL` constructor.
    const anchor = document.createElement('a');
    anchor.href = url;

    return SAFE_CLICK_THROUGH_PROTOCOLS.indexOf(anchor.protocol.toLowerCase()) >= 0 ? anchor.href : undefined;
  }

  /**
   * Opens a click-through URL in a new tab if it is an http or https URL, see {@link getSafeUrl}.
   * The new tab gets neither a reference to the player page nor its URL as referrer.
   *
   * @returns whether the URL was opened
   */
  export function open(url: string | null | undefined): boolean {
    const safeUrl = getSafeUrl(url);
    if (!safeUrl) {
      return false;
    }

    // With these features, `window.open` returns null instead of the new window.
    const openedWindow = window.open(safeUrl, '_blank', 'noopener,noreferrer');

    // Engines that ignore these features, such as older TV browsers, return the new window with an `opener` instead.
    // Clearing it keeps the advertiser page from navigating the player page. The referrer cannot be withdrawn anymore.
    if (openedWindow) {
      try {
        openedWindow.opener = null;
      } catch {
        // The engine does not let the opener be cleared, so there is nothing else to do.
      }
    }
    return true;
  }
}
