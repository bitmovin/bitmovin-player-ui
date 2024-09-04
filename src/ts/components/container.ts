import { ComponentConfig, Component, ViewModeChangedEventArgs, ViewMode } from './component';
import {DOM} from '../dom';
import {ArrayUtils} from '../arrayutils';
import { i18n } from '../localization/i18n';

/**
 * Configuration interface for a {@link Container}.
 *
 * @category Configs
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
 *
 * @category Components
 */
export class Container<Config extends ContainerConfig> extends Component<Config> {

  /**
   * A reference to the inner element that contains the components of the container.
   */
  private innerContainerElement: DOM;
  private componentsToAdd: Component<ComponentConfig>[];
  private componentsToRemove: Component<ComponentConfig>[];
  private componentsInPersistentViewMode: number;

  constructor(config: Config) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-container',
      components: [],
    } as Config, this.config);

    this.componentsToAdd = [];
    this.componentsToRemove = [];
    this.componentsInPersistentViewMode = 0;
  }

  /**
   * Adds a child component to the container.
   * @param component the component to add
   */
  addComponent(component: Component<ComponentConfig>) {
    this.config.components.push(component);
    this.componentsToAdd.push(component);
  }

  /**
   * Removes a child component from the container.
   * @param component the component to remove
   * @returns {boolean} true if the component has been removed, false if it is not contained in this container
   */
  removeComponent(component: Component<ComponentConfig>): boolean {
    if (ArrayUtils.remove(this.config.components, component) != null) {
      this.componentsToRemove.push(component);
      return true;
    } else {
      return false;
    }
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
    for (let component of this.getComponents().slice()) {
      this.removeComponent(component);
    }
  }

  /**
   * Updates the DOM of the container with the current components.
   */
  protected updateComponents(): void {
    /* We cannot just clear the container to remove all elements and then re-add those that should stay, because
     * IE looses the innerHTML of unattached elements, leading to empty elements within the container (e.g. missing
     * subtitle text in SubtitleLabel).
     * Instead, we keep a list of elements to add and remove, leaving remaining elements alone. By keeping them in
     * the DOM, their content gets preserved in all browsers.
     */
    let component;

    while (component = this.componentsToRemove.shift()) {
      component.getDomElement().remove();
    }

    while (component = this.componentsToAdd.shift()) {
      this.innerContainerElement.append(component.getDomElement());
    }
  }

  protected toDomElement(): DOM {
    // Create the container element (the outer <div>)
    let containerElement = new DOM(this.config.tag, {
      'id': this.config.id,
      'class': this.getCssClasses(),
      'role': this.config.role,
      'aria-label': i18n.performLocalization(this.config.ariaLabel),
    }, this);

    // Create the inner container element (the inner <div>) that will contain the components
    let innerContainer = new DOM(this.config.tag, {
      'class': this.prefixCss('container-wrapper'),
    });
    this.innerContainerElement = innerContainer;

    for (let initialComponent of this.config.components) {
      this.componentsToAdd.push(initialComponent);
    }
    this.updateComponents();

    containerElement.append(innerContainer);

    return containerElement;
  }

  protected suspendHideTimeout(): void {
    // to be implemented in subclass
  }

  protected resumeHideTimeout(): void {
    // to be implemented in subclass
  }

  protected trackComponentViewMode(mode: ViewMode) {
    if (mode === ViewMode.Persistent) {
      this.componentsInPersistentViewMode++;
    } else if (mode === ViewMode.Temporary) {
      this.componentsInPersistentViewMode = Math.max(this.componentsInPersistentViewMode - 1, 0);
    }

    console.error(this, this.componentsInPersistentViewMode);

    if (this.componentsInPersistentViewMode > 0) {
      // There is at least one component that must not be hidden,
      // therefore the hide timeout must be suspended
      this.suspendHideTimeout();
    } else {
      this.resumeHideTimeout();
    }
  }
}