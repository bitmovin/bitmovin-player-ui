import { ComponentConfig, Component, ViewModeChangedEventArgs, ViewMode } from './Component';
import {DOM} from '../DOM';
import {ArrayUtils} from '../utils/ArrayUtils';
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

    while ((component = this.componentsToRemove.shift()) !== undefined) {
      component.getDomElement().remove();
    }

    while ((component = this.componentsToAdd.shift()) !== undefined) {
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

    if (typeof this.config.tabIndex === 'number') {
      containerElement.attr('tabindex', this.config.tabIndex.toString());
    }

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

    if (this.componentsInPersistentViewMode > 0) {
      // There is at least one component that must not be hidden,
      // therefore the hide timeout must be suspended
      this.suspendHideTimeout();
    } else {
      this.resumeHideTimeout();
    }
  }

  /**
   * Enhanced hide method with complete JavaScript-based animation for smooth container collapse.
   * Handles all spacing and layout properties to prevent choppy animations.
   */
  hide(animated: boolean = false): void {
    if (!this.isHidden()) {
      const element = this.getDomElement();
      
      if (animated) {
        this.hideWithAnimation(element);
      } else {
        super.hide();
      }
    }
  }

  /**
   * Performs smooth JavaScript-based hide animation handling all layout properties.
   */
  private hideWithAnimation(element: DOM): void {
    const domElement = element.get(0);
    const parentElement = domElement.parentElement;
    
    // Animation duration from SCSS variable (300ms)
    const animationDuration = 300;
    const startTime = performance.now();
    
    // Phase 1: Measure current dimensions and spacing
    const computedStyle = window.getComputedStyle(domElement);
    const parentComputedStyle = parentElement ? window.getComputedStyle(parentElement) : null;
    
    const initialHeight = domElement.offsetHeight;
    const initialOpacity = parseFloat(computedStyle.opacity);
    const initialMarginBottom = parseFloat(computedStyle.marginBottom) || 0;
    const initialMarginTop = parseFloat(computedStyle.marginTop) || 0;
    const initialRowGap = parentComputedStyle ? parseFloat(parentComputedStyle.rowGap) || 0 : 0;
    
    // Phase 2: Set explicit values for smooth animation start
    domElement.style.height = `${initialHeight}px`;
    domElement.style.opacity = `${initialOpacity}`;
    domElement.style.marginBottom = `${initialMarginBottom}px`;
    domElement.style.marginTop = `${initialMarginTop}px`;
    domElement.style.overflow = 'hidden';
    domElement.style.transition = 'none'; // Disable CSS transitions
    
    // Reduce parent row-gap if it exists
    if (parentElement && initialRowGap > 0) {
      parentElement.style.rowGap = `${initialRowGap}px`;
      parentElement.style.transition = 'none';
    }
    
    // Phase 3: Animate using requestAnimationFrame
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      // Animate all properties simultaneously
      domElement.style.opacity = `${initialOpacity * (1 - easeOut)}`;
      domElement.style.height = `${initialHeight * (1 - easeOut)}px`;
      domElement.style.marginBottom = `${initialMarginBottom * (1 - easeOut)}px`;
      domElement.style.marginTop = `${initialMarginTop * (1 - easeOut)}px`;
      
      // Animate parent row-gap if applicable
      if (parentElement && initialRowGap > 0) {
        parentElement.style.rowGap = `${initialRowGap * (1 - easeOut)}px`;
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Phase 4: Animation complete - cleanup and finalize
        this.finalizeHideAnimation(element, parentElement, initialRowGap);
      }
    };
    
    // Start animation
    requestAnimationFrame(animate);
  }
  
  /**
   * Finalizes the hide animation by setting display: none and cleaning up styles.
   */
  private finalizeHideAnimation(element: DOM, parentElement: Element | null, initialRowGap: number): void {
    const domElement = element.get(0);
    
    // Set final state
    super.hide(); // This adds the hidden class
    domElement.style.display = 'none';
    
    // Clean up inline styles
    domElement.style.height = '';
    domElement.style.opacity = '';
    domElement.style.marginBottom = '';
    domElement.style.marginTop = '';
    domElement.style.overflow = '';
    domElement.style.transition = '';
    
    // Restore parent row-gap
    if (parentElement && initialRowGap > 0) {
      parentElement.style.rowGap = '';
      parentElement.style.transition = '';
    }
  }

  /**
   * Enhanced show method with complete JavaScript-based animation for smooth container expansion.
   * Performs reverse animation of hide() for consistent user experience.
   */
  show(animated: boolean = false): void {
    if (this.isHidden()) {
      const element = this.getDomElement();
      
      if (animated) {
        this.showWithAnimation(element);
      } else {
        super.show();
      }
    }
  }

  /**
   * Performs smooth JavaScript-based show animation (reverse of hide animation).
   */
  private showWithAnimation(element: DOM): void {
    const domElement = element.get(0);
    const parentElement = domElement.parentElement;
    
    // Animation duration from SCSS variable (300ms)
    const animationDuration = 300;
    const startTime = performance.now();
    
    // Phase 1: Set initial hidden state for animation start
    domElement.style.height = '0px';
    domElement.style.opacity = '0';
    domElement.style.marginBottom = '0px';
    domElement.style.marginTop = '0px';
    domElement.style.overflow = 'hidden';
    domElement.style.transition = 'none'; // Disable CSS transitions
    domElement.style.display = 'flex'; // Make visible for measurement
    
    // Set parent row-gap to 0 initially if it exists
    let initialRowGap = 0;
    if (parentElement) {
      const parentComputedStyle = window.getComputedStyle(parentElement);
      initialRowGap = parseFloat(parentComputedStyle.rowGap) || 0;
      if (initialRowGap > 0) {
        parentElement.style.rowGap = '0px';
        parentElement.style.transition = 'none';
      }
    }
    
    // Phase 2: Remove hidden class to allow measurement of natural dimensions
    super.show();
    
    // Phase 3: Measure target dimensions and spacing
    // Force a reflow to get accurate measurements
    domElement.offsetHeight;
    
    const computedStyle = window.getComputedStyle(domElement);
    const targetHeight = domElement.scrollHeight; // Natural height without height constraint
    const targetOpacity = parseFloat(computedStyle.opacity) || 1;
    const targetMarginBottom = parseFloat(computedStyle.marginBottom) || 0;
    const targetMarginTop = parseFloat(computedStyle.marginTop) || 0;
    
    // Reset to animation start state after measurement
    domElement.style.height = '0px';
    domElement.style.opacity = '0';
    domElement.style.marginBottom = '0px';
    domElement.style.marginTop = '0px';
    
    // Phase 4: Animate using requestAnimationFrame
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      // Animate all properties simultaneously FROM 0 TO target values
      domElement.style.opacity = `${targetOpacity * easeOut}`;
      domElement.style.height = `${targetHeight * easeOut}px`;
      domElement.style.marginBottom = `${targetMarginBottom * easeOut}px`;
      domElement.style.marginTop = `${targetMarginTop * easeOut}px`;
      
      // Animate parent row-gap if applicable
      if (parentElement && initialRowGap > 0) {
        parentElement.style.rowGap = `${initialRowGap * easeOut}px`;
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Phase 5: Animation complete - cleanup and finalize
        this.finalizeShowAnimation(element, parentElement);
      }
    };
    
    // Start animation
    requestAnimationFrame(animate);
  }
  
  /**
   * Finalizes the show animation by cleaning up inline styles.
   */
  private finalizeShowAnimation(element: DOM, parentElement: Element | null): void {
    const domElement = element.get(0);
    
    // Clean up inline styles to let CSS take over
    domElement.style.height = '';
    domElement.style.opacity = '';
    domElement.style.marginBottom = '';
    domElement.style.marginTop = '';
    domElement.style.overflow = '';
    domElement.style.transition = '';
    
    // Restore parent row-gap
    if (parentElement) {
      parentElement.style.rowGap = '';
      parentElement.style.transition = '';
    }
  }
}