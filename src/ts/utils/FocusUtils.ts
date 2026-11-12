/**
 * Keyboard focus helpers that work for a UI rendered into the document as well as into a Shadow DOM.
 */
export namespace FocusUtils {
  const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]';

  /**
   * Returns the focused element of the document or shadow root that contains the given element.
   */
  export function getFocusedElement(context: HTMLElement): HTMLElement | null {
    const root = typeof context.getRootNode === 'function' ? (context.getRootNode() as Document | ShadowRoot) : null;
    // A shadow root reports `null` while focus is outside of it, and a detached element has no root with focus.
    const activeElement = root?.activeElement ?? document.activeElement;

    return activeElement instanceof HTMLElement ? activeElement : null;
  }

  /**
   * Returns true if the given element or one of its descendants has focus.
   */
  export function containsFocus(element: HTMLElement): boolean {
    const focusedElement = getFocusedElement(element);
    return focusedElement != null && element.contains(focusedElement);
  }

  /**
   * Moves focus to the element without scrolling the host page, e.g. when a player that has been scrolled out of view
   * closes a panel on its own.
   */
  export function focusWithoutScrolling(element: HTMLElement): void {
    element.focus({ preventScroll: true });
  }

  /**
   * Returns the elements inside the container that are reachable with the Tab key, in DOM order.
   */
  export function getTabbableElements(container: HTMLElement): HTMLElement[] {
    const candidates: HTMLElement[] = Array.prototype.slice.call(container.querySelectorAll(FOCUSABLE_SELECTOR));
    return candidates.filter(isTabbable);
  }

  function isTabbable(element: HTMLElement): boolean {
    if (element.tabIndex < 0 || (element as HTMLButtonElement).disabled) {
      return false;
    }

    // Elements without layout boxes are inside a `display: none` subtree, e.g. an inactive settings panel page.
    return element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden';
  }
}
