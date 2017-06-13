import {ComponentConfig, Component} from './component';
import {DOM} from '../dom';
import {ArrayUtils} from '../utils';

/**
 * Configuration interface for a {@link Container}.
 */
export interface ContainerConfig extends ComponentConfig {
  /**
   * Child components of the container.
   */
  components?: Component<ComponentConfig>[];
}

/**
 * A container component that can contain a collection of child components.
 * Components can be added at construction time through the {@link ContainerConfig#components} setting, or later
 * through the {@link Container#addComponent} method. The UIManager automatically takes care of all components, i.e. it
 * initializes and configures them automatically.
 *
 * In the DOM, the container consists of an outer <div> (that can be configured by the config) and an inner wrapper
 * <div> that contains the components. This double-<div>-structure is often required to achieve many advanced effects
 * in CSS and/or JS, e.g. animations and certain formatting with absolute positioning.
 *
 * DOM example:
 * <code>
 *     <div class='ui-container'>
 *         <div class='container-wrapper'>
 *             ... child components ...
 *         </div>
 *     </div>
 * </code>
 */
export class Container<Config extends ContainerConfig> extends Component<ContainerConfig> {

  /**
   * A reference to the inner element that contains the components of the container.
   */
  private innerContainerElement: DOM;

  constructor(config: ContainerConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-container',
      components: [],
    }, this.config);
  }

  /**
   * Adds a child component to the container.
   * @param component the component to add
   */
  addComponent(component: Component<ComponentConfig>) {
    this.config.components.push(component);
  }

  /**
   * Removes a child component from the container.
   * @param component the component to remove
   * @returns {boolean} true if the component has been removed, false if it is not contained in this container
   */
  removeComponent(component: Component<ComponentConfig>): boolean {
    return ArrayUtils.remove(this.config.components, component) != null;
  }

  /**
   * Gets an array of all child components in this container.
   * @returns {Component<ComponentConfig>[]}
   */
  getComponents(): Component<ComponentConfig>[] {
    return this.config.components;
  }

  /**
   * Removes all child components from the container.
   */
  removeComponents(): void {
    for (let component of this.getComponents()) {
      this.removeComponent(component);
    }
  }

  /**
   * Updates the DOM of the container with the current components.
   */
  protected updateComponents(): void {
    this.innerContainerElement.empty();

    for (let component of this.config.components) {
      this.innerContainerElement.append(component.getDomElement());
    }
  }

  protected toDomElement(): DOM {
    // Create the container element (the outer <div>)
    let containerElement = new DOM(this.config.tag, {
      'id': this.config.id,
      'class': this.getCssClasses()
    });

    // Create the inner container element (the inner <div>) that will contain the components
    let innerContainer = new DOM(this.config.tag, {
      'class': this.prefixCss('container-wrapper')
    });
    this.innerContainerElement = innerContainer;

    this.updateComponents();

    containerElement.append(innerContainer);

    return containerElement;
  }
}