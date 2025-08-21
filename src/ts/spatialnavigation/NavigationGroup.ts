import { Container, ContainerConfig } from '../components/Container';
import { Component, ComponentConfig } from '../components/Component';
import { getComponentInDirection } from './NavigationAlgorithm';
import { resolveAllComponents } from './helper/resolveAllComponents';
import { NodeEventSubscriber } from './NodeEventSubscriber';
import { isFocusable, isSettingsPanel } from './TypeGuards';
import { Action, ActionCallback, AnyComponent, Callback, Direction, Focusable, NavigationCallback } from './types';
import { FocusableContainer } from './FocusableContainer';
import { toHtmlElement } from './helper/toHtmlElement';

/**
 * Used as part of spatial navigation. Groups together different components to which you can navigate to, in a single
 * navigation group.
 *
 * Responsible for finding elements in direction on navigation and for tracking active element inside the group.
 * Triggers blur and focus on element when active element is changed, as well as click on element on `Action.SELECT`.
 * Will call `hideUi()` on passed in container if `Action.BACK` is called.
 *
 * To have more control over grouping related elements together, you can use `FocusableContainer`.
 *
 * Example 1:
 * <code>
 *   new RootNavigationGroup(uiContainer, playbackToggleOverlay, seekBar, bottomControlBar, titleBar)
 * </code>
 *
 * In this example all components which are passed to the `RootNavigationGroup` will be navigable on a 'flat' hierarchy.
 * Elements form within the bottomControlBar and the titleBar will be resolved lazily and it's possible to navigate
 * from/to every element.
 *
 * Example 2:
 * <code>
 *   new RootNavigationGroup(
 *     uiContainer, playbackToggleOverlay, seekBar, new FocusableContainer(bottomControlBar, playbackToggleButton), new FocusableContainer(titleBar)
 *   )
 * </code>
 *
 * In this example the bottomControlBar and the titleBar are considered as a group of elements. Their components
 * will still be resolved lazily, but the navigation will target the whole container instead of the individual
 * components. In addition, a primary component can be set for each `FocusableContainer`, which will be component that
 * receives focus first when the container is focused.
 *
 * @category Components
 */
export class NavigationGroup {
  protected activeComponent?: AnyComponent;
  private activeComponentBeforeDisable?: AnyComponent;
  private readonly _components: Focusable[];
  private removeElementHoverEventListeners = () => {};
  private readonly eventSubscriber: NodeEventSubscriber;

  constructor(public readonly container: Container<ContainerConfig>, ...components: Focusable[]) {
    this._components = components;
    this.eventSubscriber = new NodeEventSubscriber();
  }

  // Dynamically resolve all components within this group respecting FocusableContainers.
  protected get components(): Focusable[] {
    let componentsToConsider: Focusable[] = [];
    const focusableContainers = this._components
      .filter(component => component instanceof FocusableContainer)
      .map(component => component as FocusableContainer);

    if (this.activeComponent) {
      const activeFocusableContainer = this.getActiveFocusableContainer();
      if (activeFocusableContainer) {
        // If the active component is wihtin a focusable container, we want to include all components of that container.
        componentsToConsider.push(...activeFocusableContainer.components);
      } else {
        // If the active component is not within a focusable container, we only want to include the container itself.
        componentsToConsider.push(...focusableContainers);
      }
    }

    // Add all non-focusable containers components and flat map other containers
    const components = this._components.filter(component => !(component instanceof FocusableContainer));
    components.forEach(component => {
      if (component instanceof Container) {
        componentsToConsider.push(...resolveAllComponents(component));
      } else {
        componentsToConsider.push(component);
      }
    });

    return componentsToConsider
      .filter(component => isFocusable(component));
  }

  /**
   * If overwritten, allows to implement custom navigation behavior. Per default, the internal handler will still be
   * executed. To prevent execution of the default navigation handler, call `preventDefault()`;
   *
   * @param direction {Direction} The direction to move along
   * @param target {HTMLElement} The target element for the event
   * @param preventDefault {() => void} A function that, when called, will prevent the execution of the default handler
   */
  public onNavigation?: NavigationCallback;

  /**
   * If overwritten, allows to implement custom action behavior. Per default, the internal handler will still be
   * executed. To prevent execution of the default action handler, call `preventDefault()`;
   *
   * @param action {Action} The action that was called
   * @param target {HTMLElement} The target element that action was called on
   * @param preventDefault {() => void} A function that, when called, will prevent the execution of the default handler
   */
  public onAction?: ActionCallback;

  /**
   * Returns the active HTMLElement.
   */
  public getActiveComponent(): AnyComponent | undefined {
    return this.activeComponent;
  }

  protected focusComponent(component: Focusable): void {
    let targetComponent: AnyComponent;

    if (component instanceof FocusableContainer) {
      targetComponent = component.primaryComponent;
    } else {
      targetComponent = component;
    }

    this.blurActiveComponent();
    this.activeComponent = targetComponent;
    toHtmlElement(this.activeComponent).focus();
  }

  private blurActiveComponent(): void {
    if (!this.activeComponent) {
      return;
    }

    toHtmlElement(this.activeComponent).blur();
  }

  public focusFirstComponent(): void {
    const component = this.components[0];
    if (component) {
      this.focusComponent(component);
    }
  }

  protected defaultNavigationHandler(direction: Direction): void {
    if (!this.activeComponent) { return; }

    const containerContainingActiveComponent = this.getActiveFocusableContainer();
    if (containerContainingActiveComponent) {
      const targetComponent = getComponentInDirection(
        this.activeComponent,
        containerContainingActiveComponent.components,
        direction,
      );

      if (targetComponent) {
        this.focusComponent(targetComponent);
        return;
      }
    }

    // If no component was found within the container itself, check all components within the group
    const targetComponent = getComponentInDirection(
      this.activeComponent,
      this.components,
      direction
    );

    if (targetComponent) {
      this.focusComponent(targetComponent);
    }
  }

  protected defaultActionHandler(action: Action): void {
    switch (action) {
      case(Action.SELECT):
        if (this.activeComponent) {
          toHtmlElement(this.activeComponent).click();
        }
        break;
      case(Action.BACK):
        this.container.hide();
        break;
    }
  }

  private handleInput<T>(data: T, defaultHandler: (data: T) => void, userHandler?: Callback<T>): void {
    let handleDefault = true;
    const preventDefault = () => (handleDefault = false);

    userHandler?.(data, this.activeComponent, preventDefault);

    if (handleDefault) {
      defaultHandler.call(this, data);
    }
  }

  /**
   * Handles a navigation event.
   *
   * @param direction The direction of the navigation event
   * @returns true if navigation was successful, false otherwise
   */
  public handleNavigation(direction: Direction): void {
    if (!this.activeComponent) {
      // If we do not have an active element, the active element has been disabled by a mouseleave
      // event. We should continue the navigation at the exact place where we left off.
      if (this.activeComponentBeforeDisable) {
        this.focusComponent(this.activeComponentBeforeDisable);
      } else {
        this.focusFirstComponent();
      }
      return;
    }

    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.handleInput(direction, this.defaultNavigationHandler, this.onNavigation);
  }

  /**
   * Handles an action event.
   *
   * @param action The action of the event
   */
  public handleAction(action: Action): void {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.handleInput(action, this.defaultActionHandler, this.onAction);
  }

  /**
   * Disable navigation group
   *
   * Call blur on active element, set as undefined, and track it as element before disable.
   */
  public disable(): void {
    if (this.activeComponent) {
      this.activeComponentBeforeDisable = this.activeComponent;
      this.blurActiveComponent();
      this.activeComponent = undefined;
    }
  }

  /**
   * Enable navigation group
   *
   * Sets active element to either element that was active before disable, or first element of tracked elements.
   * If it is settings panel, it will always focus first element in the list.
   */
  public enable(): void {
    if (this.activeComponentBeforeDisable && !isSettingsPanel(this.container)) {
      this.focusComponent(this.activeComponentBeforeDisable);
      this.activeComponentBeforeDisable = undefined;
    } else {
      this.focusFirstComponent();
    }

    this.trackElementHover();
  }

  /**
   * Adds event listener for `mouseenter` on tracked elements to ensure tracking of active element will work together
   * in combination of using mouse and key events.
   */
  private trackElementHover(): void {
    this.removeElementHoverEventListeners();

    let componentsToConsider: Component<ComponentConfig>[] = [];
    this.components
      .forEach(component => {
        let elementsToConsider: Component<ComponentConfig>[];
        if (component instanceof Container) {
          elementsToConsider = resolveAllComponents(component);
        } else if (component instanceof FocusableContainer) {
          elementsToConsider = resolveAllComponents(component.container);
        } else {
          elementsToConsider = [component];
        }

        elementsToConsider.forEach(component => {
          componentsToConsider.push(component);
        });
      });

    const removeEventListenerFunctions = componentsToConsider
      .map(component => { return { component, element: toHtmlElement(component) } })
      .map(({ element, component }) => {
        const enterListener = this.focusComponent.bind(this, component);
        const exitListener = () => this.disable();

        this.eventSubscriber.on(element, 'mouseenter', enterListener);
        this.eventSubscriber.on(element, 'mouseleave', exitListener);

        return () => {
          this.eventSubscriber.off(element, 'mouseenter', enterListener);
          this.eventSubscriber.off(element, 'mouseleave', exitListener);
        };
      });

    this.removeElementHoverEventListeners = () => removeEventListenerFunctions.forEach(fn => fn());
  }

  /**
   * Dispose of navigation group
   */
  public release(): void {
    this.eventSubscriber.release();
    this.activeComponent = undefined;
    this._components.splice(0, this._components.length);
    this.removeElementHoverEventListeners();
  }

  private getActiveFocusableContainer(): FocusableContainer | undefined {
    if (!this.activeComponent) { return undefined; }

    return this._components
      .filter(component => component instanceof FocusableContainer)
      .map(component => component as FocusableContainer)
      .find(container => container.components.includes(this.activeComponent));
  }
}
