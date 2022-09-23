import { Directions } from "./SpatialNavigation";
import { Listener, SpatialNavigationEventBus } from "./SpatialNavigationEventBus";
import { SpatialNavigationGroup } from "./SpatialNavigationGroup";

export enum NavigationElementEventType {
  ELEMENT_FOCUS = 'elementfocus',
  ELEMENT_BLUR = 'elementblur',
  ELEMENT_ENTER = 'elemententer',
  ELEMENT_BACK = 'elementback',
}

export type NavigationElementEvent = {
  [NavigationElementEventType.ELEMENT_FOCUS]: SpatialNavigationElement,
  [NavigationElementEventType.ELEMENT_BLUR]: SpatialNavigationElement,
  [NavigationElementEventType.ELEMENT_ENTER]: SpatialNavigationElement,
  [NavigationElementEventType.ELEMENT_BACK]: SpatialNavigationElement,
};

export class SpatialNavigationElement extends SpatialNavigationEventBus<NavigationElementEvent> {
  public element: HTMLElement;
  public active = false;

  private overrides: {
    [key in Directions]?: (e: SpatialNavigationElement, dir?: Directions) => void;
  } = {};

  constructor(element: HTMLElement) {
    super();
    this.element = element;
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

  public addEventListener<K extends keyof NavigationElementEvent>(type: K, handler: Listener<NavigationElementEvent[K]>): void {
    console.warn('ELEM ADD LISTENER', type, handler);
    super.addEventListener(type, handler);
  }

  public override(direction: Directions, handler: (e: SpatialNavigationElement, dir?: Directions) => void) {
    this.overrides[direction] = handler;
  }

  public getOverride(direction: Directions): ((e: SpatialNavigationElement, dir?: Directions) => void) | undefined {
    return this.overrides[direction];
  }

  public focus() {
    this.active = true;
    this.dispatch(NavigationElementEventType.ELEMENT_FOCUS, this);
  }

  public blur() {
    this.active = false;
    this.dispatch(NavigationElementEventType.ELEMENT_BLUR, this);
  }

  public enter() {
    this.dispatch(NavigationElementEventType.ELEMENT_ENTER, this);
  }

  public back() {
    this.dispatch(NavigationElementEventType.ELEMENT_BACK, this);
  }
}

