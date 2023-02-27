import { NavigationGroup } from './navigationgroup';
import { Component } from '../components/component';
import { UIContainer } from '../components/uicontainer';
import { Action, Direction } from './types';

/**
 * Extends NavigationGroup and provides additional logic for hiding and showing the UI on the root container.
 */
export class RootNavigationGroup extends NavigationGroup {
  constructor(public readonly container: UIContainer, ...elements: Component<unknown>[]) {
    super(container, ...elements);

    this.container.shouldShowUi = this.shouldShowUi;
  }

  private shouldShowUi = (_: KeyboardEvent): boolean => {
    return false;
  }

  public handleAction(action: Action) {
    if (action !== Action.BACK) {
      this.container.showUi();
    }

    return super.handleAction(action);
  }

  public handleNavigation(direction: Direction) {
    this.container.showUi();

    return super.handleNavigation(direction);
  }

  protected defaultActionHandler(action: Action): boolean {
    if (action !== Action.BACK) {
      return super.defaultActionHandler(action);
    } else if (!this.container.isUiShown()) {
      return false;
    }

    this.container.hideUi();

    return true;
  }

  public release(): void {
    super.release();
  }
}
