import { ToggleButton, ToggleButtonConfig } from '../buttons/ToggleButton';
import { SettingsPanel, SettingsPanelConfig } from './SettingsPanel';
import { UIInstanceManager } from '../../UIManager';
import { Component, ComponentConfig } from '../Component';
import { ArrayUtils } from '../../utils/ArrayUtils';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../../localization/i18n';

/**
 * Configuration interface for the {@link SettingsToggleButton}.
 *
 * @category Configs
 */
export interface SettingsToggleButtonConfig extends ToggleButtonConfig {
  /**
   * The settings panel whose visibility the button should toggle.
   */
  settingsPanel: SettingsPanel<SettingsPanelConfig>;

  /**
   * Decides if the button should be automatically hidden when the settings panel does not contain any active settings.
   * Default: true
   */
  autoHideWhenNoActiveSettings?: boolean;
}

/**
 * A button that toggles visibility of a settings panel.
 *
 * @category Buttons
 */
export class SettingsToggleButton extends ToggleButton<SettingsToggleButtonConfig> {
  private visibleSettingsPanels: SettingsPanel<SettingsPanelConfig>[] = [];

  constructor(config: SettingsToggleButtonConfig) {
    super(config);

    if (!config.settingsPanel) {
      throw new Error('Required SettingsPanel is missing');
    }

    // Setting both ariaLabels on the parent ToggleButton suppresses its default
    // `aria-pressed` attribute (see the ToggleButtonConfig.ariaLabel doc) so we don't end
    // up announcing both pressed/unpressed *and* expanded/collapsed for the same widget.
    // Using the same localizer for both states keeps the announced name stable.
    const settingsLabel = i18n.getLocalizer('settings');
    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-settingstogglebutton',
        text: settingsLabel,
        onAriaLabel: settingsLabel,
        offAriaLabel: settingsLabel,
        settingsPanel: null,
        autoHideWhenNoActiveSettings: true,
      },
      <SettingsToggleButtonConfig>this.config,
    );

    // The element renders as a native `<button>` (with the explicit `role="button"`
    // inherited from the Button base). aria-haspopup="menu" advertises that activation
    // reveals a menu, and aria-controls points assistive tech at the panel id, which
    // is refreshed whenever the panel's active page changes (see `configure`).
    // We intentionally do not set aria-owns: when it points at the same element as
    // aria-controls, iOS VoiceOver follows both relationships and announces the menu
    // twice. The WAI-ARIA APG menu button pattern uses aria-controls alone.
    this.getDomElement().attr('aria-haspopup', 'menu');
    this.updateAriaPanelIdRefs();
    this.getDomElement().attr('aria-expanded', 'false');
  }

  private updateAriaPanelIdRefs(): void {
    const settingsPanel = this.getConfig().settingsPanel;
    if (!settingsPanel) return;
    const settingsPanelId = settingsPanel.getActivePage().getConfig().id;
    this.getDomElement().attr('aria-controls', settingsPanelId);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    const config = this.getConfig();
    const settingsPanel = config.settingsPanel;

    this.onClick.subscribe(() => {
      // only hide other `SettingsPanel`s if a new one will be opened
      if (!settingsPanel.isShown()) {
        // Hide all open SettingsPanels before opening this button's panel
        // (We need to iterate a copy because hiding them will automatically remove themselves from the array
        // due to the subscribeOnce above)
        this.visibleSettingsPanels
          .slice()
          .filter(settingsPanel => settingsPanel.getConfig().hideOnOtherSettingsPanelOpening)
          .forEach(settingsPanel => settingsPanel.hide());
      }
      settingsPanel.toggleHidden();
    });
    settingsPanel.onShow.subscribe(() => {
      // Set toggle status to on when the settings panel shows
      this.on();
      this.getDomElement().attr('aria-expanded', 'true');
    });
    settingsPanel.onHide.subscribe(() => {
      // Set toggle status to off when the settings panel hides
      this.off();
      this.getDomElement().attr('aria-expanded', 'false');
    });

    // Keep aria-controls / aria-owns pointing at the *currently* active page id —
    // the user may navigate into sub-pages while the panel is open.
    settingsPanel.onActivePageChanged.subscribe(() => this.updateAriaPanelIdRefs());

    // Sync aria-expanded with the panel's current visibility in case the panel was
    // already shown before `configure()` ran (`hidden: false`, manual `show()`, etc.).
    this.getDomElement().attr('aria-expanded', settingsPanel.isShown() ? 'true' : 'false');

    // Ensure that only one `SettingPanel` is visible at once
    // Keep track of shown SettingsPanels
    uimanager.onComponentShow.subscribe((sender: Component<ComponentConfig>) => {
      if (sender instanceof SettingsPanel && sender.getConfig().hideOnOtherSettingsPanelOpening) {
        this.visibleSettingsPanels.push(sender);
        sender.onHide.subscribeOnce(() => ArrayUtils.remove(this.visibleSettingsPanels, sender));
      }
    });

    // Handle automatic hiding of the button if there are no settings for the user to interact with
    if (config.autoHideWhenNoActiveSettings) {
      // Setup handler to show/hide button when the settings change
      const settingsPanelItemsChangedHandler = () => {
        if (settingsPanel.rootPageHasActiveSettings()) {
          if (this.isHidden()) {
            this.show();
          }
        } else {
          if (this.isShown()) {
            this.hide();
          }
        }
      };
      // Wire the handler to the event
      settingsPanel.onSettingsStateChanged.subscribe(settingsPanelItemsChangedHandler);
      // Call handler for first init at startup
      settingsPanelItemsChangedHandler();
    }
  }
}
