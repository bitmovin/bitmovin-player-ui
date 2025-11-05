import { ContainerConfig, Container } from '../Container';
import { UIInstanceManager } from '../../UIManager';
import { HugeReplayButton } from '../buttons/HugeReplayButton';
import { PlayerAPI } from 'bitmovin-player';
import { RecommendationItem } from '../RecommendationItem';

/**
 * Overlays the player and displays recommended videos.
 *
 * @category Containers
 */
export class RecommendationOverlay extends Container<ContainerConfig> {
  private static readonly CLASS_HAS_RECOMMENDATIONS = 'recommendations';
  readonly replayButton: HugeReplayButton;
  readonly recommendationContainer: Container<ContainerConfig>;

  constructor(config: ContainerConfig = {}) {
    super(config);

    this.replayButton = new HugeReplayButton();
    this.recommendationContainer = new Container({
      components: [],
      cssClasses: ['recommendation-overlay-row', 'recommendations-section'],
    });

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-recommendation-overlay',
        hidden: true,
        components: [
          new Container({
            components: [this.replayButton, this.recommendationContainer],
            cssClasses: ['recommendation-overlay-row', 'replay-section'],
          }),
        ],
      },
      this.config,
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    const clearRecommendations = () => {
      this.recommendationContainer.removeComponents();
      this.recommendationContainer.updateComponents();
      this.getDomElement().removeClass(this.prefixCss(RecommendationOverlay.CLASS_HAS_RECOMMENDATIONS));
    };

    const setupRecommendations = () => {
      clearRecommendations();

      const recommendations = uimanager.getConfig().metadata.recommendations;
      if (recommendations.length == 0) {
        return;
      }

      let index = 1;
      recommendations.forEach(recommendationConfig => {
        const recommendationItem = new RecommendationItem({
          recommendationConfig: recommendationConfig,
          cssClasses: ['recommendation-item-' + index++],
        });
        recommendationItem.configure(player, uimanager);
        this.recommendationContainer.addComponent(recommendationItem);
      });

      this.recommendationContainer.updateComponents();
      this.getDomElement().addClass(this.prefixCss(RecommendationOverlay.CLASS_HAS_RECOMMENDATIONS));
    };

    uimanager.getConfig().events.onUpdated.subscribe(setupRecommendations);
    // Remove recommendations and hide overlay when source is unloaded
    player.on(player.exports.PlayerEvent.SourceUnloaded, () => {
      clearRecommendations();
      this.hide();
    });
    // Display recommendations when playback has finished
    player.on(player.exports.PlayerEvent.PlaybackFinished, () => {
      this.show();
    });
    // Hide recommendations when playback starts, e.g. a restart
    player.on(player.exports.PlayerEvent.Play, () => {
      this.hide();
    });

    // Init on startup
    setupRecommendations();
  }
}
