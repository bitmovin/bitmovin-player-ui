import {ContainerConfig, Container} from './container';
import {Component, ComponentConfig} from './component';
import {DOM} from '../dom';
import {UIInstanceManager} from '../uimanager';
import {StringUtils} from '../stringutils';
import {HugeReplayButton} from './hugereplaybutton';
import { UIRecommendationConfig } from '../uiconfig';
import { PlayerAPI } from 'bitmovin-player';

/**
 * Overlays the player and displays recommended videos.
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

/**
 * Configuration interface for the {@link RecommendationItem}
 */
interface RecommendationItemConfig extends ComponentConfig {
  itemConfig: UIRecommendationConfig;
}

/**
 * An item of the {@link RecommendationOverlay}. Used only internally in {@link RecommendationOverlay}.
 */
class RecommendationItem extends Component<RecommendationItemConfig> {

  constructor(config: RecommendationItemConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-recommendation-item',
      itemConfig: null, // this must be passed in from outside
    }, this.config);
  }

  protected toDomElement(): DOM {
    let config = (<RecommendationItemConfig>this.config).itemConfig; // TODO fix generics and get rid of cast

    let itemElement = new DOM('a', {
      'id': this.config.id,
      'class': this.getCssClasses(),
      'href': config.url,
    }).css({ 'background-image': `url(${config.thumbnail})` });

    let bgElement = new DOM('div', {
      'class': this.prefixCss('background'),
    });
    itemElement.append(bgElement);

    let titleElement = new DOM('span', {
      'class': this.prefixCss('title'),
    }).append(new DOM('span', {
      'class': this.prefixCss('innertitle'),
    }).html(config.title));
    itemElement.append(titleElement);

    let timeElement = new DOM('span', {
      'class': this.prefixCss('duration'),
    }).append(new DOM('span', {
      'class': this.prefixCss('innerduration'),
    }).html(config.duration ? StringUtils.secondsToTime(config.duration) : ''));
    itemElement.append(timeElement);

    return itemElement;
  }
}