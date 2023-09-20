import { Container } from '../components/container';
import { Component } from '../components/component';
import { getElementInDirection, getElementInDirectionFromPoint } from './navigationalgorithm';
import { getHtmlElementsFromComponents } from './gethtmlelementsfromcomponents';
import { NodeEventSubscriber } from './nodeeventsubscriber';
import { isSettingsPanel } from './typeguards';
import { Action, ActionCallback, Callback, Direction, NavigationCallback } from './types';

/**
 * Used as part of spatial navigation. Groups together different components to which you can navigate to, in a single
 * navigation group.
 *
 * Responsible for finding elements in direction on navigation and for tracking active element inside the group.
 * Triggers blur and focus on element when active element is changed, as well as click on element on `Action.SELECT`.
 * Will call `hideUi()` on passed in container if `Action.BACK` is called.
 */
export class NavigationGroup {
  private activeElement?: HTMLElement;
  private activeElementBeforeDisable?: HTMLElement;
  private readonly components: Component<unknown>[];
  private removeElementHoverEventListeners = () => {};
  private readonly eventSubscriber: NodeEventSubscriber;
  private mousePosition?: {x: number, y: number};

  constructor(public readonly container: Container<unknown>, ...components: Component<unknown>[]) {
    this.components = components;
    this.eventSubscriber = new NodeEventSubscriber();
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
  public getActiveElement(): HTMLElement | undefined {
    return this.activeElement;
  }

  private focusElement(element: HTMLElement): void {
    this.blurActiveElement();
    this.activeElement = element;
    this.activeElement.focus();
  }

  private blurActiveElement(): void {
    this.activeElement?.blur();
  }

  private focusFirstElement(): void {
    const element = getHtmlElementsFromComponents(this.components)[0];
    if (element) {
      this.focusElement(element);
    }
  }

  protected defaultNavigationHandler(direction: Direction): void {
    const targetElement = getElementInDirection(
      this.activeElement,
      getHtmlElementsFromComponents(this.components),
      direction,
    );

    if (targetElement) {
      this.focusElement(targetElement);
    }
  }

  protected defaultActionHandler(action: Action): void {
    switch (action) {
      case(Action.SELECT):
        this.activeElement.click();
        break;
      case(Action.BACK):
        this.container.hide();
        break;
    }
  }

  private handleInput<T>(data: T, defaultHandler: (data: T) => void, userHandler?: Callback<T>): void {
    let handleDefault = true;
    const preventDefault = () => (handleDefault = false);

    if (!this.activeElement) {
      if (this.activeElementBeforeDisable) {
        this.focusElement(this.activeElementBeforeDisable);
      } else {
        this.focusFirstElement();
      }
    }

    userHandler?.(data, this.activeElement, preventDefault);

    if (handleDefault) {
      defaultHandler.call(this, data);
    }
  }

  /**
   * Handles a navigation event.
   *
   * @param direction The direction of the navigation event
   */
  public handleNavigation(direction: Direction): void {
    if (!this.activeElement && this.mousePosition) {
      const targetElement = getElementInDirectionFromPoint(
        this.mousePosition,
        getHtmlElementsFromComponents(this.components),
        direction
      );
      if (targetElement) {
        this.focusElement(targetElement);
      }
    } else {
      this.handleInput(
        direction,
        this.defaultNavigationHandler,
        this.onNavigation
      );
    }
  }

  /**
   * Handles an action event.
   *
   * @param action The action of the event
   */
  public handleAction(action: Action): void {
    this.handleInput(action, this.defaultActionHandler, this.onAction);
  }

  /**
   * Disable navigation group
   *
   * Call blur on active element, set as undefined, and track it as element before disable.
   */
  public disable(): void {
    if (this.activeElement) {
      this.activeElementBeforeDisable = this.activeElement;
      this.blurActiveElement();
      this.activeElement = undefined;
    }
  }

  /**
   * Enable navigation group
   *
   * Sets active element to either element that was active before disable, or first element of tracked elements.
   * If it is settings panel, it will always focus first element in the list.
   */
  public enable(): void {
    if (this.activeElementBeforeDisable && !isSettingsPanel(this.container)) {
      this.focusElement(this.activeElementBeforeDisable);
      this.activeElementBeforeDisable = undefined;
    } else {
      this.focusFirstElement();
    }

    this.trackElementHover();
  }

  /**
   * Adds event listener for `mouseenter` on tracked elements to ensure tracking of active element will work together
   * in combination of using mouse and key events.
   */
  private trackElementHover(): void {
    this.removeElementHoverEventListeners();

    const removeEventListenerFunctions = getHtmlElementsFromComponents(this.components).map(htmlElem => {
      const listener = () => {
        console.log('MouseOver' + htmlElem.id);
        this.focusElement(htmlElem);
      };
      const exitListener = () => {
        console.log('Mouse leave ' + htmlElem.id);
        this.disable();
      };

      this.eventSubscriber.on(htmlElem, 'mouseenter', listener);
      this.eventSubscriber.on(htmlElem, 'mouseleave', exitListener);

      return [
        () => this.eventSubscriber.off(htmlElem, 'mouseenter', listener),
        () => this.eventSubscriber.off(htmlElem, 'mouseleave', exitListener),
      ];
    });

    const saveLastMousePosition = (ev: MouseEvent) =>
      (this.mousePosition = { x: ev.clientX, y: ev.clientY });
    document.addEventListener('mousemove', saveLastMousePosition);
    removeEventListenerFunctions.push([
      () => {
        document.removeEventListener('mousemove', saveLastMousePosition);
      },
    ]);

    this.removeElementHoverEventListeners = () =>
      removeEventListenerFunctions.forEach((listeners) =>
        listeners.forEach((fn) => fn())
      );
  }

  /**
   * Dispose of navigation group
   */
  public release(): void {
    this.eventSubscriber.release();
    this.activeElement = undefined;
    this.components.splice(0, this.components.length);
    this.removeElementHoverEventListeners();
  }
}
