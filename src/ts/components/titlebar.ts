import {Container, ContainerConfig} from './container';
import {UIInstanceManager} from '../uimanager';
import {MetadataLabel, MetadataLabelContent} from './metadatalabel';

/**
 * Configuration interface for a {@link TitleBar}.
 */
export interface TitleBarConfig extends ContainerConfig {
  /**
   * Specifies if the title bar should stay hidden when no metadata label contains any text. Does not make a lot
   * of sense if the title bar contains other components than just MetadataLabels (like in the default configuration).
   * Default: false
   */
  keepHiddenWithoutMetadata?: boolean;
}

/**
 * Displays a title bar containing a label with the title of the video.
 */
export class TitleBar extends Container<TitleBarConfig> {

  constructor(config: TitleBarConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-titlebar',
      hidden: true,
      components: [
        new MetadataLabel({ content: MetadataLabelContent.Title }),
        new MetadataLabel({ content: MetadataLabelContent.Description })
      ],
      keepHiddenWithoutMetadata: false,
    }, <TitleBarConfig>this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = <TitleBarConfig>this.getConfig();
    let shouldBeShown = !this.isHidden();
    let hasMetadataText = true; // Flag to track if any metadata label contains text

    let checkMetadataTextAndUpdateVisibility = () => {
      hasMetadataText = false;

      // Iterate through metadata labels and check if at least one of them contains text
      for (let component of this.getComponents()) {
        if (component instanceof MetadataLabel) {
          if (!component.isEmpty()) {
            hasMetadataText = true;
            break;
          }
        }
      }

      if (this.isShown()) {
        // Hide a visible titlebar if it does not contain any text and the hidden flag is set
        if (config.keepHiddenWithoutMetadata && !hasMetadataText) {
          this.hide();
        }
      } else if (shouldBeShown) {
        // Show a hidden titlebar if it should actually be shown
        this.show();
      }
    };

    // Listen to text change events to update the hasMetadataText flag when the metadata dynamically changes
    for (let component of this.getComponents()) {
      if (component instanceof MetadataLabel) {
        component.onTextChanged.subscribe(checkMetadataTextAndUpdateVisibility);
      }
    }

    uimanager.onControlsShow.subscribe(() => {
      shouldBeShown = true;
      if (!(config.keepHiddenWithoutMetadata && !hasMetadataText)) {
        this.show();
      }
    });
    uimanager.onControlsHide.subscribe(() => {
      shouldBeShown = false;
      this.hide();
    });

    // init
    checkMetadataTextAndUpdateVisibility();
  }
}