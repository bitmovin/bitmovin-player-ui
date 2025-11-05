import { Component, ComponentConfig } from './Component';
import { ExternalRecommendationLink, RecommendationConfig } from '../UIConfig';
import { EventDispatcher, NoArgs, Event } from '../EventDispatcher';
import { PlayerAPI, SourceConfig } from 'bitmovin-player';
import { UIInstanceManager } from '../UIManager';
import { DOM } from '../DOM';
import { Label } from './labels/Label';
import { StringUtils } from '../utils/StringUtils';

/**
 * Configuration interface for the {@link RecommendationItem}
 */
export interface RecommendationItemConfig extends ComponentConfig {
  /**
   * The recommendation configuration for this item.
   */
  recommendationConfig: RecommendationConfig;
}

/**
 * An item of the {@link RecommendationOverlay}.
 */
export class RecommendationItem extends Component<RecommendationItemConfig> {
  private events = {
    onClick: new EventDispatcher<RecommendationItem, NoArgs>(),
  };

  constructor(config: RecommendationItemConfig) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-recommendation-item',
        recommendationConfig: null, // this must be passed in from outside
        tabIndex: 0,
      },
      this.config,
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager) {
    super.configure(player, uimanager);

    if (isExternalRecommendationLink(this.config.recommendationConfig.resource)) {
      return;
    }

    this.onClick.subscribe(() => {
      player.load(this.config.recommendationConfig.resource as SourceConfig);
      player.play();
    });
  }

  protected toDomElement(): DOM {
    const recommendationConfig = this.config.recommendationConfig;
    const recommendationResource = recommendationConfig.resource;

    let tagName: string;
    let additionalAttributes: { [name: string]: string } = {};
    let posterUrl: string | null;
    if (isExternalRecommendationLink(recommendationResource)) {
      tagName = 'a';
      additionalAttributes = { href: recommendationResource.url };
      posterUrl = recommendationResource.thumbnail;
    } else {
      tagName = 'button';
      posterUrl = recommendationResource.poster;
    }

    const itemElement = new DOM(
      tagName,
      {
        id: this.config.id,
        class: this.getCssClasses(),
        ...additionalAttributes,
        tabindex: this.config.tabIndex.toString(),
      },
      this,
    );

    if (posterUrl) {
      itemElement.css({ 'background-image': `url(${posterUrl})` });
    }

    const titleElement = new DOM(
      'div',
      {
        class: this.prefixCss('title-container'),
      },
      this,
    );

    const innerTitleElement = new Label({ text: recommendationConfig.title, cssClass: 'title' });
    titleElement.append(innerTitleElement.getDomElement());
    itemElement.append(titleElement);

    if (recommendationConfig.duration != null) {
      const timeElement = new Label({
        text: recommendationConfig.duration ? StringUtils.secondsToTime(recommendationConfig.duration) : '',
        cssClass: 'duration',
      });
      itemElement.append(timeElement.getDomElement());
    }

    if (!isExternalRecommendationLink(recommendationResource)) {
      // Only add click handler if it's not a link already and we need to load a new source
      itemElement.on('click', e => {
        e.preventDefault();
        e.stopPropagation();
        this.onClickEvent();
      });
    }

    return itemElement;
  }

  protected onClickEvent() {
    this.events.onClick.dispatch(this);
  }

  get onClick(): Event<RecommendationItem, NoArgs> {
    return this.events.onClick.getEvent();
  }
}

function isExternalRecommendationLink(obj: any): obj is ExternalRecommendationLink {
  return 'url' in obj;
}
