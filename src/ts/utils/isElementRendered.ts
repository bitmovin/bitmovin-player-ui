/**
 * Checks that an element can take focus because it is actually rendered: it is not disabled, neither it nor an
 * ancestor up to `root` carries the `hiddenClass` of a hidden component, and it is not hidden through CSS
 * (`display: none` on it or an ancestor, or `visibility: hidden`).
 *
 * @param element the element to check
 * @param hiddenClass the prefixed CSS class of hidden components, e.g. `bmpui-hidden`
 * @param root the ancestor up to which the hidden class is checked, the element itself by default
 */
export function isElementRendered(element: HTMLElement, hiddenClass: string, root: HTMLElement = element): boolean {
  if ((element as HTMLButtonElement).disabled) {
    return false;
  }

  for (let current: HTMLElement | null = element; current; current = current.parentElement) {
    if (current.classList.contains(hiddenClass)) {
      return false;
    }
    if (current === root) {
      break;
    }
  }

  if (typeof element.checkVisibility === 'function') {
    // `visibilityProperty` is the current name of the option, older engines only know `checkVisibilityCSS`
    return element.checkVisibility({ visibilityProperty: true, checkVisibilityCSS: true });
  }

  return isRenderedByComputedStyle(element);
}

/**
 * Fallback for engines without `Element.checkVisibility()`. `visibility` is inherited, so the element's own computed
 * value covers its ancestors, while `display: none` has to be looked up on every ancestor.
 */
function isRenderedByComputedStyle(element: HTMLElement): boolean {
  const view = element.ownerDocument.defaultView;
  if (!view) {
    return true;
  }

  if (view.getComputedStyle(element).visibility === 'hidden') {
    return false;
  }

  for (let current: Element | null = element; current; current = current.parentElement) {
    if (view.getComputedStyle(current).display === 'none') {
      return false;
    }
  }

  return true;
}
