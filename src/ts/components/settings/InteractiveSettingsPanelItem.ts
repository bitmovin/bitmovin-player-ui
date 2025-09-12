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

  private touchState = {
    startX: 0,
    startY: 0,
    moved: false,
    touchId: null as number | null,
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

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) {
        this.touchState.startX = touch.clientX;
        this.touchState.startY = touch.clientY;
        this.touchState.moved = false;
        this.touchState.touchId = touch.identifier;
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (this.touchState.touchId === null) {
        return;
      }

      // Handle touch events with movement detection.
      // This allows us to differentiate between a tap and a swipe.
      const MOVEMENT_THRESHOLD = 10;  // pixels
      const touch = Array.from(event.touches).find(t => t.identifier === this.touchState.touchId);
      if (touch) {
        if (this.touchState.moved) {
          return;
        }

        const deltaX = Math.abs(touch.clientX - this.touchState.startX);
        const deltaY = Math.abs(touch.clientY - this.touchState.startY);
        
        if (deltaX > MOVEMENT_THRESHOLD || deltaY > MOVEMENT_THRESHOLD) {
          this.touchState.moved = true;
        }
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (this.touchState.touchId === null) {
        return;
      }

      const touch = Array.from(event.changedTouches).find(t => t.identifier === this.touchState.touchId);
      if (touch && !this.touchState.moved) {
        // Only trigger click if the touch didn't move significantly (indicating a tap)
        handleClickEvent(event);
      }

      this.touchState.touchId = null;
      this.touchState.moved = false;
    };

    this.getDomElement().on('click', (event: MouseEvent) => {
      // Only handle mouse clicks, not touch events
      if (event.type === 'click' && event.detail > 0) {
        handleClickEvent(event);
      }
    });

    this.getDomElement().on('touchstart', handleTouchStart);
    this.getDomElement().on('touchmove', handleTouchMove);
    this.getDomElement().on('touchend', handleTouchEnd);

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
