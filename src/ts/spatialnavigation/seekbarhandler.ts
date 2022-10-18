import { RootNavigationGroup } from './rootnavigationgroup';
import { NodeEventSubscriber } from './nodeeventsubscriber';
import { Action, Direction } from './types';

const DefaultScrubSpeedPercentage = 0.005;
const ScrubSpeedClearInterval = 100;
const ScrubSpeedMultiplier = 1.1;

export class SeekBarHandler {
  private readonly cursorPosition = { x: 0, y: 0};
  private readonly eventSubscriber: NodeEventSubscriber;
  private isScrubbing = false;
  private scrubSpeedResetTimeout: number;
  private scrubSpeedPercentage = DefaultScrubSpeedPercentage;

  constructor(private readonly rootNavigationGroup: RootNavigationGroup) {
    this.rootNavigationGroup.onAction = this.onAction;
    this.eventSubscriber = new NodeEventSubscriber();
    this.rootNavigationGroup.onNavigation = this.onNavigation;
  }

  private updateScrubSpeedPercentage(): void {
    clearTimeout(this.scrubSpeedResetTimeout);
    this.scrubSpeedPercentage *= ScrubSpeedMultiplier;
    this.scrubSpeedResetTimeout = window.setTimeout(
      () => this.scrubSpeedPercentage = DefaultScrubSpeedPercentage, ScrubSpeedClearInterval,
    );
  }

  private getIncrement(direction: Direction, seekBarWrapper: HTMLElement): number {
    this.updateScrubSpeedPercentage();

    const seekBarWidth = seekBarWrapper.getBoundingClientRect().width;
    const increment = seekBarWidth * this.scrubSpeedPercentage;

    return direction === Direction.RIGHT ? increment : -increment;
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

  private readonly onNavigation = (direction: Direction, target: HTMLElement, preventDefault: () => void): void => {
    if (!isSeekBarWrapper(target)) {
      return;
    }

    if (direction === Direction.UP || direction === Direction.DOWN) {
      this.stopSeeking(getSeekBar(target));

      return;
    }

    this.initializeOrUpdateCursorPosition(target, direction);
    this.dispatchMouseMoveEvent(getSeekBar(target));

    preventDefault();
  };

  private dispatchMouseClickEvent(seekBar: Element): void {
    const mouseDownHandler = () => {
      const mouseEventInit = this.getCursorPositionMouseEventInit();

      document.dispatchEvent(new MouseEvent('mouseup', mouseEventInit));
      this.eventSubscriber.off(seekBar, 'mousedown', mouseDownHandler);
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

  private readonly onAction = (action: Action, target: HTMLElement, preventDefault: () => void): void => {
    if (!isSeekBarWrapper(target)) {
      return;
    }

    const seekBar = getSeekBar(target);

    if (action === Action.SELECT && this.isScrubbing) {
      this.dispatchMouseClickEvent(seekBar);
      preventDefault();
    } else if (action === Action.BACK) {
      this.stopSeeking(seekBar);
      preventDefault();
    }
  };

  public release(): void {
    this.eventSubscriber.release();
    this.rootNavigationGroup.onAction = undefined;
    this.rootNavigationGroup.onNavigation = undefined;
  }
}

function isSeekBarWrapper(element: HTMLElement): boolean {
  return Array.from(element.classList).findIndex(className => /-ui-seekbar$/.test(className)) > -1;
}

function getSeekBar(seekBarWrapper: HTMLElement): Element {
  return seekBarWrapper.children.item(0);
}

function getPlaybackPositionMarker(seekBarWrapper: HTMLElement): HTMLElement {
  return seekBarWrapper.querySelector('[class*="seekbar-playbackposition-marker"]');
}
