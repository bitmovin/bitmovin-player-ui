import {ContainerConfig, Container} from '../Container';
import {Component, ComponentConfig} from '../Component';
import {DOM} from '../../DOM';
import {UIInstanceManager} from '../../UIManager';
import {StringUtils} from '../../utils/StringUtils';
import {HugeReplayButton} from '../buttons/HugeReplayButton';
import { UIRecommendationConfig } from '../../UIConfig';
import { PlayerAPI } from 'bitmovin-player';

/**
 * Overlays the player and displays recommended videos.
 *
 * @category Containers
 */
export class RecommendationOverlay extends Container<ContainerConfig> {

  private replayButton: HugeReplayButton;

  constructor(config: ContainerConfig = {}) {
    super(config);

    this.replayButton = new HugeReplayButton();

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-recommendation-overlay',
      hidden: true,
      components: [this.replayButton],
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let clearRecommendations = () => {
      for (let component of this.getComponents().slice()) {
        if (component instanceof RecommendationItem) {
          this.removeComponent(component);
        }
      }
      this.updateComponents();
      this.getDomElement().removeClass(this.prefixCss('recommendations'));
    };

    let setupRecommendations = () => {
      clearRecommendations();

      const recommendations = uimanager.getConfig().recommendations;

      if (recommendations.length > 0) {
        let index = 1;
        for (let item of recommendations) {
          this.addComponent(new RecommendationItem({
            itemConfig: item,
            cssClasses: ['recommendation-item-' + (index++)],
          }));
        }
        this.updateComponents(); // create container DOM elements

        this.getDomElement().addClass(this.prefixCss('recommendations'));
      }
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
