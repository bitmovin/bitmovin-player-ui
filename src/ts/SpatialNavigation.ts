enum Directions {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
}

enum Actions {
  ENTER = 'enter',
  BACK = 'back',
}

const KeyCode: {[key: number]: Directions | Actions} = {
  4: Directions.LEFT,
  21: Directions.LEFT,
  37: Directions.LEFT,
  214: Directions.LEFT,
  205: Directions.LEFT,
  218: Directions.LEFT,
  5: Directions.RIGHT,
  22: Directions.RIGHT,
  39: Directions.RIGHT,
  213: Directions.RIGHT,
  206: Directions.RIGHT,
  217: Directions.RIGHT,
  29460: Directions.UP,
  19: Directions.UP,
  38: Directions.UP,
  211: Directions.UP,
  203: Directions.UP,
  215: Directions.UP,
  29461: Directions.DOWN,
  20: Directions.DOWN,
  40: Directions.DOWN,
  212: Directions.DOWN,
  204: Directions.DOWN,
  216: Directions.DOWN,
  29443: Actions.ENTER,
  13: Actions.ENTER,
  67: Actions.ENTER,
  32: Actions.ENTER,
  23: Actions.ENTER,
  195: Actions.ENTER,
  69: Actions.BACK,
};


export class SpatialNavigation {
  private navigationGroups: NavigationGroup[] = [];
  constructor() {}

  public addNavigationGroup(...navigationGroups: NavigationGroup[]) {
    navigationGroups.forEach(v => this.navigationGroups.push(v));
  }

  public get activeNavigationGroup() {
    console.warn(this.navigationGroups);
    return this.navigationGroups.find(v => !v.disabled);
  }

  public handleKeyEvent(e: KeyboardEvent) {
    const direction: Directions | Actions = KeyCode[e.keyCode];

    if (Object.keys(Directions)(direction)) {
      this.activeNavigationGroup.handleNavigation(direction as Directions);
    }
  }

  public focusElement(el: NavigationElement) {
    const exists = this.activeNavigationGroup.getElements().findIndex(elem => elem === el);

    if (exists > -1) {
      this.activeNavigationGroup.focusElement(el);
    }
  }

  public left() {
    this.activeNavigationGroup.handleNavigation(Directions.LEFT);
  }

  public right() {
    this.activeNavigationGroup.handleNavigation(Directions.RIGHT);
  }

  public up() {
    this.activeNavigationGroup.handleNavigation(Directions.UP);

  }

  public down() {
    this.activeNavigationGroup.handleNavigation(Directions.DOWN);
  }

  public back() {

  }

  public enter() {

  }
}

function getElementInDirection(navigationGroup: NavigationGroup, direction: Directions) {
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

  return elementsToConsider.reduce<NavigationElement | null>((prev, curr) => {
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


export class NavigationElement {
  public element: HTMLElement;
  public active = false;
  private listeners: {
    [key: string]: ((el: NavigationElement) => void)[],
  } = {};

  private overrides: {
    [key in Directions]?: (e: NavigationElement, dir?: Directions) => void;
  } = {};

  constructor(element: HTMLElement, listeners?: {[key: string]: ((el: NavigationElement) => void)[]}) {
    this.element = element;
    if (listeners) {
      this.listeners = listeners;
    }
  }

  public getElementSpatialLocation() {
    const rect = this.element.getBoundingClientRect();

    const centerY = rect.y + (rect.height / 2);
    const centerX = rect.x + (rect.width / 2);

    return {
      ...rect,
      centerX,
      centerY,
    };
  }

  public override(direction: Directions, handler: (e: NavigationElement, dir?: Directions) => void) {
    this.overrides[direction] = handler;
  }

  public getOverride(direction: Directions): ((e: NavigationElement, dir?: Directions) => void) | undefined {
    return this.overrides[direction];
  }

  public addListener(type: string, handler: any) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }

    this.listeners[type].push(handler);
  }

  public removeListener(type: string, handler: any) {
    this.listeners[type] = (this.listeners[type] || []).filter(hnd => hnd !== handler);
  }

  private getListenersForType(type: string) {
    return (this.listeners[type] || []);
  }

  private triggerListener(type: string) {
    this.getListenersForType(type).forEach(handler => handler(this));
  }

  public focus() {
    this.active = true;
    this.triggerListener('focus');
  }

  public blur() {
    this.active = false;
    this.triggerListener('blur');
  }

  public enter() {
    this.triggerListener('enter');
  }

}

enum NavigationGroupEventType {
  ELEMENT_FOCUS = 'elementfocus',
  ELEMENT_BLUR = 'elementblur',
  GROUP_DISABLE = 'groupdisable',
  GROUP_ENABLE = 'groupenable',
}

type NavigationGroupEvent = {
  [NavigationGroupEventType.ELEMENT_FOCUS]: (element: NavigationElement) => void;
  [NavigationGroupEventType.ELEMENT_BLUR]: (element: NavigationElement) => void;
  [NavigationGroupEventType.GROUP_DISABLE]: (element: NavigationGroup) => void;
  [NavigationGroupEventType.GROUP_ENABLE]: (element: NavigationGroup) => void;
};

export class NavigationGroup {
  private elements: NavigationElement[] = [];
  public disabled = true;
  private listeners: {
    [key: string]: ((args: any) => void)[];
  } = {};

  public addSelector(selector: string) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(elem => {
      if (elem) {
        this.elements.push(new NavigationElement(elem as HTMLElement));
      }
    });
  }

  public getElements(): NavigationElement[] {
    return this.elements;
  }

  public getActiveElement(): NavigationElement | undefined {
    return this.elements.find(el => el.active);
  }

  public addElement(element: HTMLElement): void {
    this.elements.push(new NavigationElement(element));
  }

  public addNavigationElement(element: NavigationElement): void {
    this.elements.push(element);
  }

  public focusElement(element: NavigationElement): void {
    const active = this.getActiveElement();
    if (active) {
      active.blur();
      this.dispatch(NavigationGroupEventType.ELEMENT_BLUR, active);
    }
    element.focus();
    this.dispatch(NavigationGroupEventType.ELEMENT_FOCUS, element);
  }

  public focusFirstElement(): void {
    const el = this.elements[0];
    if (el) {
      this.focusElement(el);
    }
  }

  public handleNavigation(direction: Directions) {
    const targetElement = getElementInDirection(this, direction);
    if (targetElement) {
      this.focusElement(targetElement);
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
