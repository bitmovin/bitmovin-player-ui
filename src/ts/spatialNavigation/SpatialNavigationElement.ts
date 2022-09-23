import { Directions } from './SpatialNavigation';
import { SpatialNavigationEventBus } from './SpatialNavigationEventBus';

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

interface Coordinate {
  x: number;
  y: number;
}

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

  public getElementSpatialLocation(): DOMRect {
    return this.element.getBoundingClientRect();
  }

  public getElementTopLeftVertex(): Coordinate {
    const rect = this.element.getBoundingClientRect();

    return {
      x: rect.left,
      y: rect.top,
    };
  }

  public getElementTopRightVertex(): Coordinate {
    const rect = this.element.getBoundingClientRect();

    return {
      x: rect.right,
      y: rect.top,
    };
  }

  public getElementBottonLeftVertex(): Coordinate {
    const rect = this.element.getBoundingClientRect();

    return {
      x: rect.left,
      y: rect.bottom,
    };
  }

  public getElementBottomRightVertex(): Coordinate {
    const rect = this.element.getBoundingClientRect();

    return {
      x: rect.right,
      y: rect.bottom,
    };
  }

  private minimumDistanceFromPoint(point: Coordinate): number {
    return Math.min(...[
      this.getElementTopLeftVertex(),
      this.getElementTopRightVertex(),
      this.getElementBottonLeftVertex(),
      this.getElementBottomRightVertex(),
    ].map(currPoint => manhattenDistance(point, currPoint)));
  }

  public minimumDistanceFrom(elem: SpatialNavigationElement): number {
    return Math.min(...[
      elem.getElementTopLeftVertex(),
      elem.getElementTopRightVertex(),
      elem.getElementBottonLeftVertex(),
      elem.getElementBottomRightVertex(),
    ].map((point) => this.minimumDistanceFromPoint(point)));
  }

  public override(direction: Directions, handler: (e: SpatialNavigationElement, dir?: Directions) => void): void {
    this.overrides[direction] = handler;
  }

  public getOverride(direction: Directions): ((e: SpatialNavigationElement, dir?: Directions) => void) | undefined {
    return this.overrides[direction];
  }

  public focus(): void {
    this.active = true;
    this.dispatch(NavigationElementEventType.ELEMENT_FOCUS, this);
  }

  public blur(): void {
    this.active = false;
    this.dispatch(NavigationElementEventType.ELEMENT_BLUR, this);
  }

  public enter(): void {
    this.dispatch(NavigationElementEventType.ELEMENT_ENTER, this);
  }

  public back(): void {
    this.dispatch(NavigationElementEventType.ELEMENT_BACK, this);
  }
}

function manhattenDistance(p1: Coordinate, p2: Coordinate): number {
  return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
}
