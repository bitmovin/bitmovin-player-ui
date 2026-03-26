import { NavigationGroup } from './NavigationGroup';
import { UIContainer } from '../components/UIContainer';
import { Action, Direction, Focusable } from './types';

/**
 * Extends NavigationGroup and provides additional logic for hiding and showing the UI on the root container.
 *
 * @category Components
 */
export class RootNavigationGroup extends NavigationGroup {
  constructor(
    public readonly container: UIContainer,
    ...elements: Focusable[]
  ) {
    super(container, ...elements);
  }

  public handleAction(action: Action): boolean {
    if (action !== Action.BACK) {
      this.container.showUi();
    }

    return super.handleAction(action);
  }

  public handleNavigation(direction: Direction): boolean {
    this.container.showUi();

    return super.handleNavigation(direction);
  }

  protected defaultActionHandler(action: Action): boolean {
    if (action !== Action.BACK) {
      return super.defaultActionHandler(action);
    }

    if (!this.isUiShown()) {
      return false;
    }

    this.container.hideUi();

    return true;
  }

  private isUiShown(): boolean {
    const classList = this.container.getDomElement().get(0)?.classList;

    if (!classList) {
      return false;
    }

    return Array.from(classList).some(className => /-controls-shown$/.test(className));
  }

  public release(): void {
    super.release();
  }
}
