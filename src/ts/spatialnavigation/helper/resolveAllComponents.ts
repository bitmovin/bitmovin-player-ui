import { isComponent, isContainer } from '../TypeGuards';
import { AnyComponent, AnyContainer } from '../types';

/**
 * Recursively resolves a container and the components contained within them, building a flat list of components.
 *
 * @param container The container to get the contained components from
 */
export function resolveAllComponents(container: AnyContainer): AnyComponent[] {
  const childComponents: AnyComponent[] = [];

  container.getComponents().forEach(containerOrComponent => {
    if (isContainer(containerOrComponent)) {
      childComponents.push(...resolveAllComponents(containerOrComponent));
    } else if (isComponent(containerOrComponent)) {
      childComponents.push(containerOrComponent);
    }
  });

  return childComponents;
}
