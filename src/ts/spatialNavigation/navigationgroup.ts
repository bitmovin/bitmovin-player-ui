import { Action, Direction } from './spatialnavigation';
import { Container } from '../components/container';
import { Component } from '../components/component';
import { getElementInDirection } from './navigationalgorithm';
import { getHtmlElementsFromComponents } from './gethtmlelementsfromcomponents';
import { NodeEventSubscriber } from './nodeeventsubscriber';
import { isSettingsPanel } from './typeguards';

export type NavigationCallback = (direction: Direction, target: HTMLElement) => boolean;
export type ActionCallback = (action: Action, target: HTMLElement) => boolean;

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
   * Adds onNavigation override
   * @param direction {Direction}
   * @param target {HTMLElement}
   *
   * @returns Boolean - true means it should stop propagation, and false means it should be handled by default handler
   */
  public onNavigation?: NavigationCallback;

  /**
   * Adds onAction override
   * @param action {Action}
   * @param target {HTMLElement}
   *
   * @returns Boolean - true means it should stop propagation, and false means it should be handled by default handler
   */
  public onAction?: ActionCallback;

  public getActiveElement(): HTMLElement | undefined {
    return this.activeElement;
  }

  public focusElement(element: HTMLElement): void {
    this.blurActiveElement();
    this.activeElement = element;
    this.activeElement.focus();
  }

  public blurActiveElement(): void {
    this.activeElement?.blur();
    this.activeElement = undefined;
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

  public handleNavigation(direction: Direction): void {
    const stopPropagation = this.onNavigation?.(direction, this.activeElement) ?? false;

    if (!stopPropagation) {
      this.defaultNavigationHandler(direction);
    }
  }

  public handleAction(action: Action): void {
    const stopPropagation = this.onAction?.(action, this.activeElement) ?? false;

    if (!stopPropagation) {
      this.defaultActionHandler(action);
    }
  }

  public disable(): void {
    if (this.activeElement) {
      this.activeElementBeforeDisable = this.activeElement;
      this.blurActiveElement();
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
  }
}
