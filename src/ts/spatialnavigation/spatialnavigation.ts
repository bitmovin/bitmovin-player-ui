import { NavigationGroup } from './navigationgroup';
import { RootNavigationGroup } from './rootnavigationgroup';
import { NodeEventSubscriber } from './nodeeventsubscriber';
import { SeekBarHandler } from './seekbarhandler';
import { getKeyMapForPlatform } from './keymap';
import { Action, Direction, KeyMap } from './types';
import { isAction, isDirection } from './typeguards';

/**
 * SpatialNavigation keeps track of all navigation groups, and updates the active navigation group when visibility
 * changes on group container.
 *
 * It listens to key events, and triggers either handleNavigation or handleAction on the active group.
 * SeekBarHandler will get instantiated with root navigation group and disposed on release of the spatial navigation.
 */
export class SpatialNavigation {
  private unsubscribeVisibilityChangesFns: (() => void)[];
  private readonly navigationGroups: NavigationGroup[] = [];
  private readonly activeNavigationGroups: NavigationGroup[];
  private readonly eventSubscriber: NodeEventSubscriber;
  private readonly seekBarHandler: SeekBarHandler;
  private readonly keyMap: KeyMap;

  constructor(rootNavigationGroup: RootNavigationGroup, ...navigationGroups: NavigationGroup[]) {
    this.seekBarHandler = new SeekBarHandler(rootNavigationGroup);

    this.activeNavigationGroups = [];
    this.unsubscribeVisibilityChangesFns = [];
    this.eventSubscriber = new NodeEventSubscriber();
    this.navigationGroups = [rootNavigationGroup, ...navigationGroups];
    this.keyMap = getKeyMapForPlatform();

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

  /**
   * Subscribes to onHide and onShow on all navigation groups containers as Spatial navigation tracks active navigation
   * group based on their container visibility.
   */
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

  /**
   * It will enable group of which container is currently shown
   * If there are no groups with containers that are currently visible, it will enable root navigation group
   */
  private enableDefaultNavigationGroup(): void {
    const isShown = (group: NavigationGroup) => group.container.isShown();
    const groupToEnable = this.navigationGroups.find(isShown) ?? this.navigationGroups[0];

    if (groupToEnable) {
      this.activeNavigationGroups.push(groupToEnable);
      this.updateEnabledNavigationGroup();
    }
  }

  /**
   * Disables navigation groups that are no longer active and calls enable on last pushed navigation group
   */
  private updateEnabledNavigationGroup(): void {
    this.activeNavigationGroups.forEach((group, idx) => {
      if (idx < this.activeNavigationGroups.length - 1) {
        group.disable();
      } else {
        group.enable();
      }
    });
  }

  /**
   * Returns currently active navigation group
   */
  public getActiveNavigationGroup(): NavigationGroup | undefined {
    return this.activeNavigationGroups[this.activeNavigationGroups.length - 1];
  }

  /**
   * Checks if keyboard event keycode is tracked either as Direction or Action and calls appropriate handler on active
   * navigation group
   *
   * @param e {KeyboardEvent}
   */
  private handleKeyEvent = (e: KeyboardEvent): void => {
    const event: Direction | Action | undefined = this.keyMap[getKeyCode(e)];
    const activeNavigationGroup = this.getActiveNavigationGroup();

    if (isDirection(event) && activeNavigationGroup.handleNavigation(event)) {
      e.preventDefault();
      e.stopPropagation();
    } else if (isAction(event) && activeNavigationGroup.handleAction(event)) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  /**
   * Dispose of SpatialNavigation
   *
   * Remove all event handlers, release seekbar handler and release all navigation groups.
   */
  public release(): void {
    this.unsubscribeFromNavigationGroupVisibilityChanges();
    this.eventSubscriber.release();
    this.navigationGroups.forEach(group => group.release());
    this.seekBarHandler.release();
  }
}

function getKeyCode(event: KeyboardEvent): number {
  return event.keyCode;
}
