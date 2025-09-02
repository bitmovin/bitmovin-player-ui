import { AnyComponent } from '../types';

/**
 * Returns the HTML elements associated to the provided component.
 *
 * @param component The component to get the HTML elements from
 */
export function toHtmlElement(component: AnyComponent): HTMLElement {
  return component.getDomElement().get(0);
}
