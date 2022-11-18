import { NavigationGroup } from './navigationgroup';
import { Action, Direction } from './types';

export class ListNavigationGroup extends NavigationGroup {
  public handleAction(action: Action) {
    super.handleAction(action);

    if (action === Action.SELECT) {
      // close the container when a list entry is selected
      this.handleAction(Action.BACK);
    }
  }

  public handleNavigation(direction: Direction) {
    super.handleNavigation(direction);

    if (![Direction.UP, Direction.DOWN].includes(direction)) {
      // close the container on any input other than up and down
      this.handleAction(Action.BACK);
    }
  }
}
