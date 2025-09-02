import { NavigationGroup } from './NavigationGroup';
import { RecommendationOverlay } from '../components/overlays/RecommendationOverlay';
import { FocusableContainer } from './FocusableContainer';
import { Focusable } from './types';

export class RecommendationOverlayNavigationGroup extends NavigationGroup {
  private readonly recommendationOverlay: RecommendationOverlay;

  constructor(recommendationOverlay: RecommendationOverlay) {
    super(
      recommendationOverlay,
      recommendationOverlay.replayButton,
      new FocusableContainer(recommendationOverlay.recommendationContainer),
    );

    this.recommendationOverlay = recommendationOverlay;
  }

  protected override getComponents(): Focusable[] {
    const hasRecommendations = this.recommendationOverlay.recommendationContainer.getComponents().length > 0;
    if (hasRecommendations) {
      return super.getComponents();
    } else {
      // In case we have no recommendations, we only want to be able to focus the replay button and don't allow
      // navigating to the (empty) recommendation container.
      return [this.recommendationOverlay.replayButton];
    }
  }
}
