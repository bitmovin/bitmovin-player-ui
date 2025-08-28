import {ContainerConfig, Container} from '../Container';
import {UIInstanceManager} from '../../UIManager';
import {HugeReplayButton} from '../buttons/HugeReplayButton';
import { PlayerAPI } from 'bitmovin-player';
import { RecommendationItem } from '../RecommendationItem';

/**
 * Overlays the player and displays recommended videos.
 *
 * @category Containers
 */
export class RecommendationOverlay extends Container<ContainerConfig> {

  private static readonly CLASS_HAS_RECOMMENDATIONS = 'recommendations';
  private readonly replayButton: HugeReplayButton;
  private recommendationContainer: Container<ContainerConfig> | null;

  constructor(config: ContainerConfig = {}) {
    super(config);

    this.replayButton = new HugeReplayButton();

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-recommendation-overlay',
      hidden: true,
      components: [
        new Container({
          components: [
            this.replayButton
          ],
          cssClasses: ['recommendation-overlay-row', 'replay-section'],
        }),
      ],
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let clearRecommendations = () => {
      if (this.recommendationContainer) {
        this.removeComponent(this.recommendationContainer);
        this.recommendationContainer = null;
        this.updateComponents();
        this.getDomElement().removeClass(this.prefixCss(RecommendationOverlay.CLASS_HAS_RECOMMENDATIONS));
      }
    };

    let setupRecommendations = () => {
      clearRecommendations();

      const recommendations = uimanager.getConfig().metadata.recommendations;
      const recommendationContainer = new Container({
        components: [],
        cssClasses: ['recommendation-overlay-row', 'recommendations-section']
      })

      if (recommendations.length == 0) {
        return;
      }

      let index = 1;
      recommendations.forEach(recommendationConfig => {
        const recommendationItem = new RecommendationItem({
          recommendationConfig: recommendationConfig,
          cssClasses: ['recommendation-item-' + (index++)],
        });
        recommendationContainer.addComponent(recommendationItem);
        recommendationItem.configure(player, uimanager);
      });

      this.recommendationContainer = recommendationContainer;
      this.addComponent(recommendationContainer);
      this.updateComponents();
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
