import { Component, ComponentConfig } from '../components/Component';
import { resolveAllComponents } from './helper/resolveAllComponents';
import { AnyComponent, AnyContainer } from './types';
import { isFocusable } from './TypeGuards';

/**
 * Enables grouping of focusable components within a container.
 * Spatial navigation can prioritize elements within this container over others.
 * The primary component is the one that receives focus first when the container is focused.
 */
export class FocusableContainer {
  readonly container: AnyContainer;
  private readonly _primaryComponent: AnyComponent;

  /**
   * Creates a new FocusableContainer.
   *
   * @param container The container that holds focusable components.
   * @param primaryComponent The primary component that should receive focus first when the container is focused.
   *                         If not provided, the first focusable component in the container will be used.
   */
  constructor(container: AnyContainer, primaryComponent: Component<ComponentConfig> | undefined = undefined) {
    this.container = container;
    this._primaryComponent = primaryComponent;

    if (primaryComponent && !this.components.includes(primaryComponent)) {
      throw new Error('The primary component must be part of the container.');
    }
  }

  get primaryComponent(): AnyComponent {
    return this._primaryComponent ?? this.components[0];
  }

  get components(): AnyComponent[] {
    return resolveAllComponents(this.container)
      .filter(component => isFocusable(component));
  }
}
