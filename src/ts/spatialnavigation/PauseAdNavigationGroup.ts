import { NavigationGroup } from './NavigationGroup';
import { PauseAdStatusOverlay } from '../components/ads/PauseAdStatusOverlay';
import { Action, Focusable } from './types';

/**
 * Navigation group that becomes active while a pause ad is showing.
 *
 * The creative is rendered below the UI, so the controls a viewer still needs stay reachable while
 * the large centered playback control is suppressed. Passing only the controls that remain usable is
 * what keeps the suppressed control out of reach: spatial navigation resolves focus targets from
 * group membership, not from the stylesheet.
 *
 * The dismiss button is always the first focus target, so the remote lands on the way out of the ad.
 */
export class PauseAdNavigationGroup extends NavigationGroup {
  constructor(pauseAdStatusOverlay: PauseAdStatusOverlay, ...components: Focusable[]) {
    super(pauseAdStatusOverlay, pauseAdStatusOverlay.dismissButton, ...components);
  }

  protected defaultActionHandler(action: Action): boolean {
    if (action === Action.BACK) {
      // Hiding this group's container would remove the dismiss button and the click target while the
      // creative is still on screen. BACK therefore stays unhandled and keeps whatever meaning the
      // platform or the embedding application gives it.
      return false;
    }

    return super.defaultActionHandler(action);
  }
}
