import {ContainerConfig, Container} from './container';
import {UIInstanceManager} from '../uimanager';
import {UIUtils} from '../uiutils';
import {Spacer} from './spacer';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../localization/i18n';
import { BrowserUtils } from '../browserutils';
import {Component, ComponentConfig} from './component';
import {SettingsPanel} from './settingspanel';

/**
 * Configuration interface for the {@link ControlBar}.
 */
export interface ControlBarConfig extends ContainerConfig {
  // nothing yet
}

/**
 * A container for main player control components, e.g. play toggle button, seek bar, volume control, fullscreen toggle
 * button.
 */
export class ControlBar extends Container<ControlBarConfig> {

  constructor(config: ControlBarConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-controlbar',
      hidden: true,
      role: 'region',
      ariaLabel: i18n.getLocalizer('controlBar'),
    }, <ControlBarConfig>this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    // Counts how many components are hovered and block hiding of the control bar
    let hoverStackCount = 0;
    let isSettingsPanelShown = false;

    // only enabling this for non-mobile platforms without touch input. enabling this
    // for touch devices causes the UI to not disappear after hideDelay seconds.
    // Instead, it will stay visible until another manual interaction is performed.
    if (uimanager.getConfig().disableAutoHideWhenHovered && !BrowserUtils.isMobile) {
      // Track hover status of child components
      UIUtils.traverseTree(this, (component) => {
        // Do not track hover status of child containers or spacers, only of 'real' controls
        if (component instanceof Container || component instanceof Spacer) {
          return;
        }

        // Subscribe hover event and keep a count of the number of hovered children
        component.onHoverChanged.subscribe((_, args) => {
          if (args.hovered) {
            hoverStackCount++;
          } else {
            hoverStackCount--;
          }
        });
      });
    }

    if (BrowserUtils.isMobile) {
      uimanager.onComponentShow.subscribe((component: Component<ComponentConfig>) => {
        if (component instanceof SettingsPanel) {
          isSettingsPanelShown = true;
        }
      });

      uimanager.onComponentHide.subscribe((component: Component<ComponentConfig>) => {
        if (component instanceof SettingsPanel) {
          isSettingsPanelShown = false;
        }
      });
    }

    uimanager.onControlsShow.subscribe(() => {
      this.show();
    });

    uimanager.onPreviewControlsHide.subscribe((sender, args) => {
      // Cancel the hide event if hovered child components block hiding or if the settings panel is active on mobile.
      args.cancel = (hoverStackCount > 0 || isSettingsPanelShown);
    });

    uimanager.onControlsHide.subscribe(() => {
      this.hide();
    });
  }
}
