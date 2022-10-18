import { NavigationGroup } from './navigationgroup';
import { RootNavigationGroup } from './rootnavigationgroup';
import { NodeEventSubscriber } from './nodeeventsubscriber';
import { SeekBarHandler } from './seekbarhandler';

export enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
}

export enum Action {
  SELECT = 'select',
  BACK = 'back',
}

const KeyMap: {[key: number]: Direction | Action} = {
  4: Direction.LEFT,
  21: Direction.LEFT,
  37: Direction.LEFT,
  214: Direction.LEFT,
  205: Direction.LEFT,
  218: Direction.LEFT,
  5: Direction.RIGHT,
  22: Direction.RIGHT,
  39: Direction.RIGHT,
  213: Direction.RIGHT,
  206: Direction.RIGHT,
  217: Direction.RIGHT,
  29460: Direction.UP,
  19: Direction.UP,
  38: Direction.UP,
  211: Direction.UP,
  203: Direction.UP,
  215: Direction.UP,
  29461: Direction.DOWN,
  20: Direction.DOWN,
  40: Direction.DOWN,
  212: Direction.DOWN,
  204: Direction.DOWN,
  216: Direction.DOWN,
  29443: Action.SELECT,
  13: Action.SELECT,
  67: Action.SELECT,
  32: Action.SELECT,
  23: Action.SELECT,
  195: Action.SELECT,
  27: Action.BACK,
};

export class SpatialNavigation {
  private unsubscribeVisibilityChangesFns: (() => void)[];
  private readonly navigationGroups: NavigationGroup[] = [];
  private readonly activeNavigationGroups: NavigationGroup[];
  private readonly eventSubscriber: NodeEventSubscriber;
  private readonly seekBarHandler: SeekBarHandler;

  constructor(rootNavigationGroup: RootNavigationGroup, ...navigationGroups: NavigationGroup[]) {
    this.seekBarHandler = new SeekBarHandler(rootNavigationGroup);

    this.activeNavigationGroups = [];
    this.unsubscribeVisibilityChangesFns = [];
    this.eventSubscriber = new NodeEventSubscriber();
    this.navigationGroups = [rootNavigationGroup, ...navigationGroups];

    this.subscribeToNavigationGroupVisibilityChanges();
    this.attachKeyEventHandler();
    this.enableDefaultNavigationGroup();
  }

  private attachKeyEventHandler(): void {
    this.eventSubscriber.on(document, 'keydown', this.handleKeyEvent, true);
  }

  private onShow = (group: NavigationGroup): void => {
    this.activeNavigationGroups.push(group);
    this.updateEnabledNavigationGroup();
  };

  private onHide = (group: NavigationGroup): void => {
    const groupIndex = this.activeNavigationGroups.findIndex(other => other === group);

    if (groupIndex > -1) {
      group.disable();
      this.activeNavigationGroups.splice(groupIndex, 1);
      this.updateEnabledNavigationGroup();
    }
  };

  private subscribeToNavigationGroupVisibilityChanges(): void {
    this.navigationGroups.forEach(group => {
      const onShowHandler = () => this.onShow(group);
      const onHideHandler = () => this.onHide(group);

      group.container.onShow.subscribe(onShowHandler);
      group.container.onHide.subscribe(onHideHandler);

      this.unsubscribeVisibilityChangesFns.push(
        () => group.container.onShow.unsubscribe(onShowHandler),
        () => group.container.onHide.unsubscribe(onHideHandler),
      );
    });
  }

  private unsubscribeFromNavigationGroupVisibilityChanges(): void {
    this.unsubscribeVisibilityChangesFns.forEach(unsub => unsub());
    this.unsubscribeVisibilityChangesFns = [];
  }

  private enableDefaultNavigationGroup(): void {
    const isShown = (group: NavigationGroup) => group.container.isShown();
    const groupToEnable = this.navigationGroups.find(isShown) ?? this.navigationGroups[0];

    if (groupToEnable) {
      this.activeNavigationGroups.push(groupToEnable);
      this.updateEnabledNavigationGroup();
    }
  }

  private updateEnabledNavigationGroup(): void {
    this.activeNavigationGroups.forEach((group, idx) => {
      if (idx < this.activeNavigationGroups.length - 1) {
        group.disable();
      } else {
        group.enable();
      }
    });
  }

  public getActiveNavigationGroup(): NavigationGroup | undefined {
    return this.activeNavigationGroups[this.activeNavigationGroups.length - 1];
  }

  private handleKeyEvent = (e: KeyboardEvent): void => {
    const event: Direction | Action | undefined = KeyMap[getKeyCode(e)];

    if (isDirection(event)) {
      this.getActiveNavigationGroup().handleNavigation(event);

      e.preventDefault();
      e.stopPropagation();
    }
    if (isAction(event)) {
      this.getActiveNavigationGroup().handleAction(event);

      e.preventDefault();
      e.stopPropagation();
    }
  };

  public release(): void {
    this.unsubscribeFromNavigationGroupVisibilityChanges();
    this.eventSubscriber.release();
    this.navigationGroups.forEach(group => group.release());
    this.seekBarHandler.release();
  }
}

function isDirection(direction: unknown): direction is Direction {
  return typeof direction === 'string' && Object.values<string>(Direction).includes(direction);
}

function isAction(action: unknown): action is Action {
  return typeof action === 'string' && Object.values<string>(Action).includes(action);
}

function getKeyCode(event: KeyboardEvent): number {
  return event.keyCode;
}
