import { Directions } from "./SpatialNavigation";

export enum NavigationElementEventType {
  ELEMENT_FOCUS = 'elementfocus',
  ELEMENT_BLUR = 'elementblur',
  ELEMENT_ENTER = 'elemententer',
  ELEMENT_BACK = 'elementback',
}

export type NavigationElementEvent = {
  [NavigationElementEventType.ELEMENT_FOCUS]: (element: SpatialNavigationElement) => void;
  [NavigationElementEventType.ELEMENT_BLUR]: (element: SpatialNavigationElement) => void;
  [NavigationElementEventType.ELEMENT_ENTER]: (element: SpatialNavigationElement) => void;
  [NavigationElementEventType.ELEMENT_BACK]: (element: SpatialNavigationElement) => void;
};

export class SpatialNavigationElement {
  public element: HTMLElement;
  public active = false;
  private listeners: {
    [key in NavigationElementEventType]?: (NavigationElementEvent[key])[];
  } = {};

  private overrides: {
    [key in Directions]?: (e: SpatialNavigationElement, dir?: Directions) => void;
  } = {};

  constructor(element: HTMLElement, listeners?: {[key: string]: ((el: SpatialNavigationElement) => void)[]}) {
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

  public override(direction: Directions, handler: (e: SpatialNavigationElement, dir?: Directions) => void) {
    this.overrides[direction] = handler;
  }

  public getOverride(direction: Directions): ((e: SpatialNavigationElement, dir?: Directions) => void) | undefined {
    return this.overrides[direction];
  }

  public addListener<K extends NavigationElementEventType>(type: K, handler: NavigationElementEvent[K]) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }

    this.listeners[type].push(handler);
  }

  public removeListener<K extends NavigationElementEventType>(type: K, handler: NavigationElementEvent[K]) {
    this.listeners[type] = (this.listeners[type] || []).filter(hnd => hnd !== handler);
  }

  private getListenersForType(type: NavigationElementEventType) {
    return (this.listeners[type] || []);
  }

  private triggerListener(type: NavigationElementEventType) {
    this.getListenersForType(type).forEach(handler => handler(this));
  }

  public focus() {
    this.active = true;
    this.triggerListener(NavigationElementEventType.ELEMENT_FOCUS);
  }

  public blur() {
    this.active = false;
    this.triggerListener(NavigationElementEventType.ELEMENT_BLUR);
  }

  public enter() {
    this.triggerListener(NavigationElementEventType.ELEMENT_ENTER);
  }

  public back() {
    this.triggerListener(NavigationElementEventType.ELEMENT_BACK);
  }
}

