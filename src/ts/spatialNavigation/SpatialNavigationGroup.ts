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
  public disabled = true;

  constructor(public readonly groupName: string) {
    super();
  }

  public addSelector(selector: string) {
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

  public handleNavigation(direction: Directions) {
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

  public handleAction(action: Actions) {
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

  private syncEventListenersOnElements() {
    this.getElements().forEach(element => {
      this.syncEventListenersOnElement(element);
    });
  }

  private syncEventListenersOnElement(element: SpatialNavigationElement) {
    const eventTypes = Object.values(NavigationElementEventType);
    eventTypes.forEach(type => {
      this.getListenersForType(type).forEach(listener => {
        element.addEventListener(type, listener);
      })
    })
  }

  public disable(): void {
    this.disabled = true;
    this.dispatch(NavigationGroupEventType.GROUP_DISABLE, this);
  }

  public enable(): void {
    this.disabled = false;
    this.dispatch(NavigationGroupEventType.GROUP_ENABLE, this);
  }
}


function getElementInDirection(navigationGroup: SpatialNavigationGroup, direction: Directions) {
  const activeElement = navigationGroup.getActiveElement();
  if (!activeElement) return null;
  const activeRect = activeElement.getElementSpatialLocation();

  const elementsToConsider = navigationGroup.getElements().filter(el => {
    if (el.active) return false;

    if (direction === Directions.UP) {
      return el.getElementSpatialLocation().centerY < activeRect.centerY;
    }
    if (direction === Directions.DOWN) {
      return el.getElementSpatialLocation().centerY > activeRect.centerY;
    }
    if (direction === Directions.LEFT) {
      return el.getElementSpatialLocation().centerX < activeRect.centerX;
    }
    if (direction === Directions.RIGHT) {
      return el.getElementSpatialLocation().centerX > activeRect.centerX;
    }
  });

  return elementsToConsider.reduce<SpatialNavigationElement | null>((prev, curr) => {
    if (prev === null) {
      return curr;
    }

    const previousRect = prev.getElementSpatialLocation();
    const currentRect = curr.getElementSpatialLocation();

    const currDist = Math.abs(activeRect.centerX - currentRect.centerX) + Math.abs(activeRect.centerY - currentRect.centerY);
    const prevDist = Math.abs(activeRect.centerX - previousRect.centerX) + Math.abs(activeRect.centerY - previousRect.centerY);

    if (currDist < prevDist) return curr;
    return prev;
  }, null);
}

function isNavigationGroupEventType(type: NavigationGroupEventType | NavigationElementEventType): type is NavigationGroupEventType {
  return Object.values(NavigationGroupEventType).includes(type as any);
}

function isNavigationElementEventType(type: NavigationGroupEventType | NavigationElementEventType): type is NavigationElementEventType {
  return Object.values(NavigationElementEventType).includes(type as any);
}