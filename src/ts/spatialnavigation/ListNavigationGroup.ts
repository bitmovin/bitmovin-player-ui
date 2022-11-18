import { NavigationGroup } from './navigationgroup';
import { Action, Direction } from './types';
import { Container } from '../components/container';
import { Component } from '../components/component';

export enum ListOrientation {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

export class ListNavigationGroup extends NavigationGroup {
  private readonly listNavigationDirections: Direction[];

  constructor(orientation: ListOrientation, container: Container<unknown>, ...components: Component<unknown>[]) {
    super(container, ...components);

    switch (orientation) {
      case ListOrientation.Vertical:
        this.listNavigationDirections = [Direction.UP, Direction.DOWN];
        break;

      case ListOrientation.Horizontal:
        this.listNavigationDirections = [Direction.LEFT, Direction.RIGHT];
        break;
    }
  }

  public handleAction(action: Action): void {
    super.handleAction(action);

    if (action === Action.SELECT) {
      // close the container when a list entry is selected
      this.handleAction(Action.BACK);
    }
  }

  public handleNavigation(direction: Direction): void {
    super.handleNavigation(direction);

    if (!this.listNavigationDirections.includes(direction)) {
      // close the container on any input other than up and down
      this.handleAction(Action.BACK);
    }
  }
}
