import { Actions, Directions } from "./SpatialNavigation";
import { NavigationElementEvent, NavigationElementEventType, SpatialNavigationElement } from "./SpatialNavigationElement";
import { Listener, SpatialNavigationEventBus } from "./SpatialNavigationEventBus";

export enum NavigationGroupEventType {
  GROUP_DISABLE = 'groupdisable',
  GROUP_ENABLE = 'groupenable',
}

export type NavigationGroupEvent = {
  [NavigationGroupEventType.GROUP_DISABLE]: SpatialNavigationGroup,
  [NavigationGroupEventType.GROUP_ENABLE]: SpatialNavigationGroup,
} & NavigationElementEvent;

export class SpatialNavigationGroup extends SpatialNavigationEventBus<NavigationGroupEvent> {
  private elements: SpatialNavigationElement[] = [];
  private selectors: string[] = [];
  private activeElementBeforeDisable?: SpatialNavigationElement;

  public disabled = true;

  constructor(public readonly groupName: string) {
    super();
  }

  public addSelector(selector: string): void {
    if (!this.selectors.includes(selector)) {
      this.selectors.push(selector);
    }

    const elements = document.querySelectorAll(selector);
    elements.forEach(elem => {
      if (elem) {
        const spatialNavigationElement = new SpatialNavigationElement(elem as HTMLElement);
        this.elements.push(spatialNavigationElement);
      }
    });
  }

  public hasElement(element: SpatialNavigationElement): boolean {
    return this.elements.includes(element);
  }

  public getElements(): SpatialNavigationElement[] {
    const hasElement = (elem: HTMLElement) => {
      return this.elements.findIndex(el => el.element === elem) > -1;
    };

    this.selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((elem: HTMLElement) => {
        if (elem && !hasElement(elem)) {
          this.addElement(elem);
        }
      });
    });

    return this.elements;
  }

  public getActiveElement(): SpatialNavigationElement | undefined {
    return this.getElements().find(el => el.active);
  }

  public addElement(element: HTMLElement): void {
    this.addSpatialNavigationElement(new SpatialNavigationElement(element));
  }

  public addSpatialNavigationElement(element: SpatialNavigationElement): void {
    this.elements.push(element);
    this.syncEventListenersOnElement(element);
  }

  public focusElement(element: SpatialNavigationElement): void {
    this.blurActiveElement();
    element.focus();
  }

  public blurActiveElement(): void {
    const active = this.getActiveElement();
    if (active) {
      active.blur();
    }
  }

  public focusFirstElement(): void {
    const el = this.getElements()[0];
    if (el) {
      this.focusElement(el);
    }
  }

  public handleNavigation(direction: Directions): void {
    const activeElement = this.getActiveElement();
    const override = activeElement.getOverride(direction);

    if (override) {
      return override(activeElement, direction);
    }

    const targetElement = getElementInDirection(this, direction);
    if (targetElement) {
      this.focusElement(targetElement);
    }
  }

  public handleAction(action: Actions): void {
    const activeElement = this.getActiveElement();
    if (!activeElement) {
      return;
    }

    switch (action) {
      case(Actions.ENTER):
        activeElement.enter();
        break;
      case(Actions.BACK):
        activeElement.back();
        break;
    }
  }

  public addEventListener<K extends NavigationGroupEventType | keyof NavigationElementEvent>(type: K, handler: Listener<NavigationGroupEvent[K]>): void {
    super.addEventListener(type, handler);
    this.syncEventListenersOnElements();
  }

  public removeEventListener<K extends NavigationGroupEventType | keyof NavigationElementEvent>(type: K, handler: Listener<NavigationGroupEvent[K]>): void {
    if (isNavigationGroupEventType(type)) {
      super.removeEventListener(type, handler);
    }
    if (isNavigationElementEventType(type)) {
      this.getElements().forEach(element => {
        element.removeEventListener(type, handler as any);
      });
    }
  }

  private syncEventListenersOnElements(): void {
    this.getElements().forEach(element => {
      this.syncEventListenersOnElement(element);
    });
  }

  private syncEventListenersOnElement(element: SpatialNavigationElement): void {
    const eventTypes = Object.values(NavigationElementEventType);
    eventTypes.forEach(type => {
      this.getListenersForType(type).forEach(listener => {
        element.addEventListener(type, listener);
      })
    })
  }

  public disable(): void {
    this.disabled = true;
    const activeElement = this.getActiveElement();
    if (activeElement) {
      this.activeElementBeforeDisable = activeElement;
      activeElement.blur();
    }
    this.dispatch(NavigationGroupEventType.GROUP_DISABLE, this);
  }

  public enable(): void {
    this.disabled = false;
    if (this.activeElementBeforeDisable) {
      this.activeElementBeforeDisable.focus();
      this.activeElementBeforeDisable = undefined;
    }
    this.dispatch(NavigationGroupEventType.GROUP_ENABLE, this);
  }
}

function upMoveFilter(currentElement: SpatialNavigationElement, activeElement: SpatialNavigationElement): boolean {
  return currentElement.getElementSpatialLocation().bottom <= activeElement.getElementSpatialLocation().top;
}

function downMoveFilter(currentElement: SpatialNavigationElement, activeElement: SpatialNavigationElement): boolean {
  return currentElement.getElementSpatialLocation().top >= activeElement.getElementSpatialLocation().bottom;
}

function rightMoveFilter(currentElement: SpatialNavigationElement, activeElement: SpatialNavigationElement): boolean {
  return currentElement.getElementSpatialLocation().left >= activeElement.getElementSpatialLocation().right;
}

function leftMoveFilter(currentElement: SpatialNavigationElement, activeElement: SpatialNavigationElement): boolean {
  return currentElement.getElementSpatialLocation().right <= activeElement.getElementSpatialLocation().left;
}

function getElementInDirection(navigationGroup: SpatialNavigationGroup, direction: Directions) {
  const activeElement = navigationGroup.getActiveElement();
  if (!activeElement) return null;
  // const activeRect = activeElement.getElementSpatialLocation();

  console.warn(navigationGroup);
  const elementsToConsider = navigationGroup.getElements().filter(el => {
    if (el.active) return false;

    if (direction === Directions.UP) {
      return upMoveFilter(el, activeElement);
    }
    if (direction === Directions.DOWN) {
      return downMoveFilter(el, activeElement);
    }
    if (direction === Directions.LEFT) {
      return leftMoveFilter(el, activeElement);
    }
    if (direction === Directions.RIGHT) {
      return rightMoveFilter(el, activeElement);
    }
  });

  console.log(elementsToConsider);

  return elementsToConsider.reduce<SpatialNavigationElement | null>((prev, curr) => {
    if (prev === null) {
      return curr;
    }

    const minDistanceFromCurrentElement = activeElement.minimumDistanceFrom(curr);
    const minDistanceFromPreviousElement = activeElement.minimumDistanceFrom(prev);
    if (minDistanceFromCurrentElement < minDistanceFromPreviousElement) {
      return curr;
    }
    return prev;
  }, null);
}

function isNavigationGroupEventType(type: NavigationGroupEventType | NavigationElementEventType): type is NavigationGroupEventType {
  return Object.values(NavigationGroupEventType).includes(type as any);
}

function isNavigationElementEventType(type: NavigationGroupEventType | NavigationElementEventType): type is NavigationElementEventType {
  return Object.values(NavigationElementEventType).includes(type as any);
}