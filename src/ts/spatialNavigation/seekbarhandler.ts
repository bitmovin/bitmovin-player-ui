import { RootNavigationGroup } from './rootnavigationgroup';
import { Action, Direction } from './spatialnavigation';
import { NodeEventSubscriber } from './nodeeventsubscriber';

const DefaultSeemAmountPercentage = 0.005;
const ScrubSpeedClearInterval = 100;
const ScrubSpeedMultiplier = 1.1;

export class SeekBarHandler {
  private readonly cursorPosition = { x: 0, y: 0};
  private readonly eventSubscriber: NodeEventSubscriber;
  private isScrubbing = false;
  private scrubSpeedResetTimeout: number;
  private scrubSpeedPercentage = DefaultSeemAmountPercentage;

  constructor(private readonly rootNavigationGroup: RootNavigationGroup) {
    this.rootNavigationGroup.onAction = this.onAction;
    this.eventSubscriber = new NodeEventSubscriber();
    this.rootNavigationGroup.onNavigation = this.onNavigation;
  }

  private updateScrubSpeedPercentage(): void {
    clearTimeout(this.scrubSpeedResetTimeout);
    this.scrubSpeedPercentage *= ScrubSpeedMultiplier;
    this.scrubSpeedResetTimeout = window.setTimeout(
      () => this.scrubSpeedPercentage = DefaultSeemAmountPercentage, ScrubSpeedClearInterval
    );
  }

  private getIncrement(direction: Direction, seekBarWrapper: HTMLElement): number {
    this.updateScrubSpeedPercentage();

    const seekBarWidth = seekBarWrapper.getBoundingClientRect().width;
    const increment = seekBarWidth * this.scrubSpeedPercentage;

    if (direction === Direction.RIGHT) {
      return increment;
    } else if (direction === Direction.LEFT) {
      return -increment;
    } else {
      return 0;
    }
  }

  private resetCursorPosition(): void {
    this.cursorPosition.x = 0;
    this.cursorPosition.y = 0;
  }

  private updateCursorPosition(direction: Direction, seekBarWrapper: HTMLElement): void {
    this.cursorPosition.x += this.getIncrement(direction, seekBarWrapper);
  }

  private initializeCursorPosition(seekBarWrapper: HTMLElement): void {
    const playbackPositionMarker = getPlaybackPositionMarker(seekBarWrapper);
    const rect = playbackPositionMarker.getBoundingClientRect();
    const startX = rect.x + (rect.width / 2);
    const startY = rect.y;

    this.cursorPosition.x = startX;
    this.cursorPosition.y = startY;
  }

  private initializeOrUpdateCursorPosition(seekBarWrapper: HTMLElement, direction: Direction): void {
    if (this.isScrubbing) {
      this.updateCursorPosition(direction, seekBarWrapper);
    } else {
      this.initializeCursorPosition(seekBarWrapper);
    }

    this.isScrubbing = true;
  }

  private getCursorPositionMouseEventInit(): MouseEventInit {
    return {
      clientX: this.cursorPosition.x,
      clientY: this.cursorPosition.y,
    };
  }

  private dispatchMouseMoveEvent(seekBar: Element): void {
    seekBar.dispatchEvent(new MouseEvent('mousemove', this.getCursorPositionMouseEventInit()));
  }

  private readonly onNavigation = (direction: Direction, target: HTMLElement): boolean => {
    if (!isSeekBarWrapper(target)) {
      return false;
    }

    if (direction === Direction.UP) {
      this.stopSeeking(getSeekBar(target));

      return false;
    }

    this.initializeOrUpdateCursorPosition(target, direction);
    this.dispatchMouseMoveEvent(getSeekBar(target));

    return true;
  };

  private dispatchMouseClickEvent(seekBar: Element): void {
    const mouseDownHandler = () => {
      const mouseEventInit = this.getCursorPositionMouseEventInit();

      document.dispatchEvent(new MouseEvent('mouseup', mouseEventInit));
      seekBar.removeEventListener('mousedown', mouseDownHandler);
      this.stopSeeking(seekBar);
    };

    this.eventSubscriber.on(seekBar, 'mousedown', mouseDownHandler);
    seekBar.dispatchEvent(new MouseEvent('mousedown'));
  }

  private stopSeeking(seekBar: Element): void {
    this.resetCursorPosition();
    this.isScrubbing = false;
    this.dispatchMouseLeaveEvent(seekBar);
  }

  private dispatchMouseLeaveEvent(seekBar: Element): void {
    seekBar.dispatchEvent(new MouseEvent('mouseleave'));
  }

  private readonly onAction = (action: Action, target: HTMLElement): boolean => {
    if (!isSeekBarWrapper(target)) {
      return false;
    }

    const seekBar = getSeekBar(target);

    if (action === Action.SELECT && this.isScrubbing) {
      this.dispatchMouseClickEvent(seekBar);
      return true;
    } else if (action === Action.BACK) {
      this.stopSeeking(seekBar);
      return true;
    }

    return false;
  };

  public release(): void {
    this.eventSubscriber.release();
    this.rootNavigationGroup.onAction = undefined;
    this.rootNavigationGroup.onNavigation = undefined;
  }
}

function isSeekBarWrapper(element: HTMLElement): boolean {
  return Array.from(element.classList).findIndex(className => className.includes('-ui-seekbar')) > -1;
}

function getSeekBar(seekBarWrapper: HTMLElement): Element {
  return seekBarWrapper.children.item(0);
}

function getPlaybackPositionMarker(seekBarWrapper: HTMLElement): HTMLElement {
  return seekBarWrapper.querySelector('[class*="seekbar-playbackposition-marker"]');
}
