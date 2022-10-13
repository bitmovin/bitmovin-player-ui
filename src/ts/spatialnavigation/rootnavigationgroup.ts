import { NavigationGroup } from './navigationgroup';
import { Component } from '../components/component';
import { Action, Direction } from './spatialnavigation';
import { UIContainer } from '../components/uicontainer';

export class RootNavigationGroup extends NavigationGroup {
  constructor(public readonly container: UIContainer, ...elements: Component<unknown>[]) {
    super(container, ...elements);
  }

  public handleAction(action: Action) {
    this.container.showUi();

    super.handleAction(action);
  }

  public handleNavigation(direction: Direction) {
    this.container.showUi();

    super.handleNavigation(direction);
  }

  protected defaultActionHandler(action: Action): void {
    if (action === Action.BACK) {
      this.container.hideUi();
    } else {
      super.defaultActionHandler(action);
    }
  }

  public release(): void {
    super.release();
  }
}
