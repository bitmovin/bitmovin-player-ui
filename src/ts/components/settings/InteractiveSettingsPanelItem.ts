import { SettingsPanelItem, SettingsPanelItemConfig } from './SettingsPanelItem';
import { Event, EventDispatcher, NoArgs } from '../../EventDispatcher';
import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../../UIManager';
import { getKeyMapForPlatform } from '../../spatialnavigation/getKeyMapForPlatform';
import { Action } from '../../spatialnavigation/types';

/**
 * A settings panel item that can be interacted with using the keyboard or mouse.
 * Can be used when no interactive element is present as child item.
 */
export class InteractiveSettingsPanelItem<Config extends SettingsPanelItemConfig> extends SettingsPanelItem<Config> {
  private events = {
    onClick: new EventDispatcher<InteractiveSettingsPanelItem<Config>, NoArgs>(),
  };


  constructor(config: Config) {
    super(config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager) {
    super.configure(player, uimanager);

    const handleClickEvent = (event: UIEvent) => {
      event.preventDefault();
      event.stopPropagation();
      this.onClickEvent();
    };


    this.getDomElement().on('click', handleClickEvent);

    // Listen to keyboard events and trigger the click event when a select key is detected
    const handleKeyDown = (event: KeyboardEvent) => {
      const action = getKeyMapForPlatform()[event.keyCode];
      const acceptedKeys = ['Enter', ' '];
      const acceptedCodes = ['Enter', 'Space'];

      if (action === Action.SELECT || acceptedKeys.includes(event.key) || acceptedCodes.includes(event.code)) {
        handleClickEvent(event);
      }
    };

    this.onFocusedChanged.subscribe((_, args) => {
      if (args.focused) {
        // Only listen to keyboard events when the element is focused
        this.getDomElement().on('keydown', handleKeyDown);
      } else {
        // Unregister the keyboard event listener when the element loses focus
        this.getDomElement().off('keydown', handleKeyDown);
      }
    });
  }

  protected onClickEvent() {
    this.events.onClick.dispatch(this);
  }

  /**
   * Gets the event that is fired when the SettingsPanelItem is clicked.
   * @returns {Event<InteractiveSettingsPanelItem<Config>, NoArgs>}
   */
  get onClick(): Event<InteractiveSettingsPanelItem<Config>, NoArgs> {
    return this.events.onClick.getEvent();
  }
}
