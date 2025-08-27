import { Container, ContainerConfig } from './Container';
import { UIInstanceManager } from '../UIManager';
import { MetadataLabel, MetadataLabelContent } from './labels/MetadataLabel';
import { PlayerAPI } from 'bitmovin-player';
import { Label } from './labels/Label';
import { Component, ComponentConfig } from './Component';

/**
 * Configuration interface for a {@link TitleBar}.
 *
 * @category Configs
 */
export interface TitleBarConfig extends ContainerConfig {
  /**
   * Specifies if the title bar should stay hidden when no label contains any text.
   * Applies to any label component with an isEmpty() method, not just MetadataLabels.
   * Default: false
   */
  keepHiddenWithoutMetadata?: boolean;
}

/**
 * Displays a title bar containing a label with the title of the video or other contextual messages.
 *
 * @category Components
 */
export class TitleBar extends Container<TitleBarConfig> {
  constructor(config: TitleBarConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-titlebar',
      hidden: true,
      keepHiddenWithoutMetadata: false,
      components: [
        new Container({
          components: [
            new MetadataLabel({ content: MetadataLabelContent.Title }),
          ],
          cssClasses: ['titlebar-row']
        }),
        new Container({
          components: [
            new MetadataLabel({ content: MetadataLabelContent.Description }),
          ],
          cssClasses: ['titlebar-row']
        }),
      ],
    }, <TitleBarConfig>this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    const config = this.getConfig();
    let shouldBeShown = !this.isHidden();
    let hasVisibleText = true;

    const checkTextAndUpdateVisibility = () => {
      hasVisibleText = this.hasNonEmptyComponents(this.getComponents());

      if (this.isShown()) {
        if (config.keepHiddenWithoutMetadata && !hasVisibleText) {
          this.hide();
        }
      } else if (shouldBeShown) {
        if (!config.keepHiddenWithoutMetadata || hasVisibleText) {
          this.show();
        }
      }
    };

    // Subscribe to any label-like component's text changes
    this.subscribeToTextChanges(this.getComponents(), checkTextAndUpdateVisibility);

    uimanager.onControlsShow.subscribe(() => {
      shouldBeShown = true;
      if (!config.keepHiddenWithoutMetadata || hasVisibleText) {
        this.show();
      }
    });

    uimanager.onControlsHide.subscribe(() => {
      shouldBeShown = false;
      this.hide();
    });

    checkTextAndUpdateVisibility();
  }

  private hasNonEmptyComponents(components: Component<ComponentConfig>[]): boolean {
    for (const component of components) {
      if (hasIsEmpty(component) && !component.isEmpty()) {
        return true;
      }

      if (component instanceof Container) {
        if (this.hasNonEmptyComponents(component.getComponents())) {
          return true;
        }
      }
    }
    return false;
  }

  private subscribeToTextChanges(components: Component<ComponentConfig>[], onChange: () => void): void {
    for (const component of components) {
      if (component instanceof Label) {
        component.onTextChanged.subscribe(onChange);
      }

      if (component instanceof Container) {
        this.subscribeToTextChanges(component.getComponents(), onChange);
      }
    }
  }
}

function hasIsEmpty(obj: unknown): obj is { isEmpty: () => boolean } {
  return typeof obj === 'object' && obj !== null && typeof (obj as any).isEmpty === 'function';
}
