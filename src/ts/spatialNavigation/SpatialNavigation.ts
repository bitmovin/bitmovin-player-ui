import {  NavigationElementEvent, NavigationElementEventType, SpatialNavigationElement } from "./SpatialNavigationElement";
import { Listener, SpatialNavigationEventBus } from "./SpatialNavigationEventBus";
import { NavigationGroupEvent, NavigationGroupEventType, SpatialNavigationGroup } from "./SpatialNavigationGroup";

export enum Directions {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
}

export enum Actions {
  ENTER = 'enter',
  BACK = 'back',
}

export const KeyCode: {[key: number]: Directions | Actions} = {
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

type SpatialNavigationEventMap = NavigationGroupEvent;

export class SpatialNavigation extends SpatialNavigationEventBus<SpatialNavigationEventMap> {
  private navigationGroups: SpatialNavigationGroup[] = [];

  constructor() {
    super();
  }

  public addNavigationGroup(...navigationGroups: SpatialNavigationGroup[]) {
    navigationGroups.forEach(navigationGroup => {
      this.navigationGroups.push(navigationGroup);
      this.syncEventListenersOnGroup(navigationGroup);
    });
  }

  private syncEventListeners() {
    this.navigationGroups.forEach(navigationGroup => this.syncEventListenersOnGroup(navigationGroup))
  }

  private syncEventListenersOnGroup(navigationGroup: SpatialNavigationGroup) {
    [...Object.values(NavigationGroupEventType), ...Object.values(NavigationElementEventType)].forEach(eventType => {
      this.getListenersForType(eventType).forEach(listener => {
        navigationGroup.addEventListener(eventType, listener);
      })
    });
  }

  public addEventListener<K extends NavigationGroupEventType | keyof NavigationElementEvent>(type: K, handler: Listener<NavigationGroupEvent[K]>): void {
    super.addEventListener(type, handler);
    this.syncEventListeners();
  }

  public removeEventListener<K extends NavigationGroupEventType | keyof NavigationElementEvent>(type: K, handler: Listener<NavigationGroupEvent[K]>): void {
    super.removeEventListener(type, handler);
    this.navigationGroups.forEach(navigationGroup => navigationGroup.removeEventListener(type, handler));
  }

  public get activeNavigationGroup() {
    return this.navigationGroups.find(v => !v.disabled);
  }

  public getNavigationGroups() {
    return this.navigationGroups;
  }

  public handleKeyEvent(e: KeyboardEvent) {
    const direction: Directions | Actions = KeyCode[e.keyCode];

    if ([...Object.values(Directions), ...Object.values(Actions)].includes(direction)) {
      this.activeNavigationGroup.handleNavigation(direction as Directions);
      e.preventDefault();
    }
  }

  public focusElement(el: SpatialNavigationElement) {
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
    this.activeNavigationGroup.handleAction(Actions.BACK);
  }

  public enter() {
    this.activeNavigationGroup.handleAction(Actions.ENTER);
  }

  public enableNavigationGroup(navigationGroup: SpatialNavigationGroup) {
    const matchingGroup = this.getNavigationGroups().find(ng => ng === navigationGroup);
    if (matchingGroup) {
      this.activeNavigationGroup.disable();
      matchingGroup.enable();
    }
  }
}
