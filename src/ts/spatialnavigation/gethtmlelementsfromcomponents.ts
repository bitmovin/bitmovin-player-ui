import { Component } from '../components/component';
import { Container } from '../components/container';
import { isComponent, isContainer, isListBox } from './typeguards';

/**
 * Recursively resolves a container and the components contained within them, building a flat list of components.
 *
 * @param container The container to get the contained components from
 */
function resolveAllComponents(container: Container<unknown>): Component<unknown>[] {
  const childComponents: Component<unknown>[] = [];

  container.getComponents().forEach(containerOrComponent => {
    if (isContainer(containerOrComponent)) {
      childComponents.push(...resolveAllComponents(containerOrComponent));
    } else if (isComponent(containerOrComponent)) {
      childComponents.push(containerOrComponent);
    }
  });

  return childComponents;
}

/**
 * Returns the HTML elements associated to the provided component.
 *
 * @param component The component to get the HTML elements from
 */
function toHtmlElement(component: Component<unknown>): HTMLElement[] {
  if (isListBox(component)) {
    return [].slice.call(component.getDomElement().get()[0].children);
  } else {
    return component.getDomElement().get().slice(0, 1);
  }
}

/**
 * Takes the provided list of components and flat-maps them to a list of their respective HTML elements. In case a
 * provided component is a container, the children of that container will be resolved recursively. Ignores components
 * that are hidden.
 *
 * @param components The components to map to HTML elements
 */
export function getHtmlElementsFromComponents(components: Component<unknown>[]): HTMLElement[] {
  const htmlElements: HTMLElement[] = [];

  components
    .filter(component => !component.isHidden())
    .forEach(component => {
      const elementsToConsider = component instanceof Container ? resolveAllComponents(component) : [component];

      elementsToConsider.forEach(component => {
        htmlElements.push(...toHtmlElement(component));
      });
    });

  return htmlElements;
}
