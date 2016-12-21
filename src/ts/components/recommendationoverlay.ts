import {ContainerConfig, Container} from './container';
import {Component, ComponentConfig} from './component';
import {DOM} from '../dom';
import {UIManager, UIRecommendationConfig} from '../uimanager';
import {StringUtils} from '../utils';
import {HugeReplayButton} from './hugereplaybutton';

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
      components: [this.replayButton]
    }, this.config);
  }

  configure(player: bitmovin.player.Player, uimanager: UIManager): void {
    super.configure(player, uimanager);

    let self = this;

    let index = 1;
    for (let item of uimanager.getConfig().recommendations) {
      this.addComponent(new RecommendationItem({
        itemConfig: item,
        cssClasses: ['recommendation-item-' + (index++)]
      }));
    }
    this.updateComponents(); // create container DOM elements

    // Display recommendations when playback has finished
    player.addEventHandler(bitmovin.player.EVENT.ON_PLAYBACK_FINISHED, function() {
      // Dismiss ON_PLAYBACK_FINISHED events at the end of ads
      // TODO remove this workaround once issue #1278 is solved
      if (player.isAd()) {
        return;
      }

      self.show();
    });
    // Hide recommendations when playback starts, e.g. a restart
    player.addEventHandler(bitmovin.player.EVENT.ON_PLAY, function() {
      self.hide();
    });
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
      itemConfig: null // this must be passed in from outside
    }, this.config);
  }

  protected toDomElement(): DOM {
    let config = (<RecommendationItemConfig>this.config).itemConfig; // TODO fix generics and get rid of cast

    let itemElement = new DOM('a', {
      'id': this.config.id,
      'class': this.getCssClasses(),
      'href': config.url
    }).css({ 'background-image': `url(${config.thumbnail})` });

    let bgElement = new DOM('div', {
      'class': this.prefixCss('background')
    });
    itemElement.append(bgElement);

    let titleElement = new DOM('span', {
      'class': this.prefixCss('title')
    }).append(new DOM('span', {
      'class': this.prefixCss('innertitle')
    }).html(config.title));
    itemElement.append(titleElement);

    let timeElement = new DOM('span', {
      'class': this.prefixCss('duration')
    }).append(new DOM('span', {
      'class': this.prefixCss('innerduration')
    }).html(config.duration ? StringUtils.secondsToTime(config.duration) : ''));
    itemElement.append(timeElement);

    return itemElement;
  }
}