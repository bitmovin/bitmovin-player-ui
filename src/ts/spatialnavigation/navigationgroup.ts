import { Action, Direction } from './spatialnavigation';
import { Container } from '../components/container';
import { Component } from '../components/component';
import { getElementInDirection } from './navigationalgorithm';
import { getHtmlElementsFromComponents } from './gethtmlelementsfromcomponents';
import { NodeEventSubscriber } from './nodeeventsubscriber';
import { isSettingsPanel } from './typeguards';

type Callback<T> = (data: T, target: HTMLElement, preventDefault: () => void) => void;
export type NavigationCallback = Callback<Direction>;
export type ActionCallback = Callback<Action>;

export class NavigationGroup {
  private activeElement?: HTMLElement;
  private activeElementBeforeDisable?: HTMLElement;
  private readonly components: Component<unknown>[];
  private removeElementHoverEventListeners = () => {};
  private readonly eventSubscriber: NodeEventSubscriber;

  constructor(public readonly container: Container<unknown>, ...components: Component<unknown>[]) {
    this.components = components;
    this.eventSubscriber = new NodeEventSubscriber();
  }

  /**
   * Adds onNavigation override.
   * Calling preventDefault will not execute default implementation
   * @param direction {Direction}
   * @param target {HTMLElement}
   * @param preventDefault {() => void}
   */
  public onNavigation?: NavigationCallback;

  /**
   * Adds onAction override.
   * Calling preventDefault will not execute default implementation
   * @param action {Action}
   * @param target {HTMLElement}
   * @param preventDefault {() => void}
   */
  public onAction?: ActionCallback;

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

    userHandler?.(data, this.activeElement, preventDefault);

    if (handleDefault) {
      defaultHandler.call(this, data);
    }
  }

  public handleNavigation(direction: Direction): void {
    this.handleInput(direction, this.defaultNavigationHandler, this.onNavigation);
  }

  public handleAction(action: Action): void {
    this.handleInput(action, this.defaultActionHandler, this.onAction);
  }

  public disable(): void {
    if (this.activeElement) {
      this.activeElementBeforeDisable = this.activeElement;
      this.blurActiveElement();
      this.activeElement = undefined;
    }
  }

  public enable(): void {
    if (this.activeElementBeforeDisable && !isSettingsPanel(this.container)) {
      this.focusElement(this.activeElementBeforeDisable);
      this.activeElementBeforeDisable = undefined;
    } else {
      this.focusFirstElement();
    }

    this.trackElementHover();
  }

  private trackElementHover(): void {
    this.removeElementHoverEventListeners();

    const removeEventListenerFunctions = getHtmlElementsFromComponents(this.components).map(htmlElem => {
      const listener = this.focusElement.bind(this, htmlElem);

      this.eventSubscriber.on(htmlElem, 'mouseenter', listener);

      return () => this.eventSubscriber.off(htmlElem, 'mouseenter', listener);
    });

    this.removeElementHoverEventListeners = () => removeEventListenerFunctions.forEach(fn => fn());
  }

  public release(): void {
    this.eventSubscriber.release();
    this.activeElement = undefined;
    this.components.splice(0, this.components.length);
    this.removeElementHoverEventListeners();
  }
}
