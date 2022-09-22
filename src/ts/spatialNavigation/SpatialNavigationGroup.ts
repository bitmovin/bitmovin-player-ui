import { Actions, Directions } from "./SpatialNavigation";
import { SpatialNavigationElement } from "./SpatialNavigationElement";

export enum NavigationGroupEventType {
  ELEMENT_FOCUS = 'elementfocus',
  ELEMENT_BLUR = 'elementblur',
  GROUP_DISABLE = 'groupdisable',
  GROUP_ENABLE = 'groupenable',
}

export type NavigationGroupEvent = {
  [NavigationGroupEventType.ELEMENT_FOCUS]: (element: SpatialNavigationElement) => void;
  [NavigationGroupEventType.ELEMENT_BLUR]: (element: SpatialNavigationElement) => void;
  [NavigationGroupEventType.GROUP_DISABLE]: (element: SpatialNavigationGroup) => void;
  [NavigationGroupEventType.GROUP_ENABLE]: (element: SpatialNavigationGroup) => void;
};

export class SpatialNavigationGroup {
  private elements: SpatialNavigationElement[] = [];
  private selectors: string[] = [];

  public disabled = true;
  private listeners: { [key: string]: ((args: any) => void)[]; } = {};

  public addSelector(selector: string) {
    if (!this.selectors.includes(selector)) {
      this.selectors.push(selector);
    }

    const elements = document.querySelectorAll(selector);
    elements.forEach(elem => {
      if (elem) {
        this.elements.push(new SpatialNavigationElement(elem as HTMLElement));
      }
    });
  }

  public getElements(): SpatialNavigationElement[] {
    const hasElement = (elem: HTMLElement) => {
      return this.elements.findIndex(el => el.element === elem) > -1;
    };

    this.selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(elem => {
        if (elem && !hasElement(elem as HTMLElement)) {
          this.elements.push(new SpatialNavigationElement(elem as HTMLElement));
        }
      });
    });

    return this.elements;
  }

  public getActiveElement(): SpatialNavigationElement | undefined {
    return this.getElements().find(el => el.active);
  }

  public addElement(element: HTMLElement): void {
    this.elements.push(new SpatialNavigationElement(element));
  }

  public addNavigationElement(element: SpatialNavigationElement): void {
    this.elements.push(element);
  }

  public focusElement(element: SpatialNavigationElement): void {
    this.blurActiveElement();
    element.focus();
    this.dispatch(NavigationGroupEventType.ELEMENT_FOCUS, element);
  }

  public blurActiveElement(): void {
    const active = this.getActiveElement();
    if (active) {
      active.blur();
      this.dispatch(NavigationGroupEventType.ELEMENT_BLUR, active);
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

  public addEventListener<K extends NavigationGroupEventType>(type: K, handler: (el: NavigationGroupEvent[K]) => void) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(handler);
  }

  private dispatch<K extends NavigationGroupEventType>(type: K,  el: Parameters<NavigationGroupEvent[K]>[0]) {
    (this.listeners[type] || []).forEach(listener => {
      listener(el);
    });
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

