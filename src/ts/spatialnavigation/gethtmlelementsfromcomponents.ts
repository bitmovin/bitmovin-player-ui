import { Component } from '../components/component';
import { Container } from '../components/container';
import { isComponent, isContainer, isListBox } from './typeguards';

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

function toHtmlElement(component: Component<unknown>): HTMLElement[] {
  if (isListBox(component)) {
    return [].slice.call(component.getDomElement().get()[0].children);
  } else {
    return component.getDomElement().get().slice(0, 1);
  }
}

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
