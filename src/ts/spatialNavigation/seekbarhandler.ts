import { RootNavigationGroup } from './rootnavigationgroup';
import { Action, Direction } from './spatialnavigation';
import { NodeEventSubscriber } from './nodeeventsubscriber';

export class SeekBarHandler {
  private readonly eventSubscriber: NodeEventSubscriber;
  private readonly cursorPosition = { x: 0, y: 0};
  private isScrubbing = false;

  constructor(private readonly rootNavigationGroup: RootNavigationGroup) {
    this.rootNavigationGroup.onAction = this.onAction;
    this.eventSubscriber = new NodeEventSubscriber();
    this.rootNavigationGroup.onNavigation = this.onNavigation;
  }

  private getIncrement(direction: Direction): number {
    // TODO: make this configurable and increase it with time
    if (direction === Direction.RIGHT) {
      return 5;
    } else if (direction === Direction.LEFT) {
      return -5;
    } else {
      return 0;
    }
  }

  private resetCursorPosition(): void {
    this.cursorPosition.x = 0;
    this.cursorPosition.y = 0;
  }

  private updateCursorPosition(direction: Direction): void {
    this.cursorPosition.x += this.getIncrement(direction);
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
      this.updateCursorPosition(direction);
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

  private dispatchMouseMoveEvent(seekBar: ChildNode): void {
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

  private dispatchMouseClickEvent(seekBar: ChildNode): void {
    const mouseDownHandler = () => {
      const mouseEventInit = this.getCursorPositionMouseEventInit();

      document.dispatchEvent(new MouseEvent('mouseup', mouseEventInit));
      seekBar.removeEventListener('mousedown', mouseDownHandler);
      this.stopSeeking(seekBar);
    };

    this.eventSubscriber.on(seekBar, 'mousedown', mouseDownHandler);
    seekBar.dispatchEvent(new MouseEvent('mousedown'));
  }

  private stopSeeking(seekBar: ChildNode): void {
    this.resetCursorPosition();
    this.isScrubbing = false;
    this.dispatchMouseLeaveEvent(seekBar);
  }

  private dispatchMouseLeaveEvent(seekBar: ChildNode): void {
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

function getSeekBar(seekBarWrapper: HTMLElement): ChildNode {
  return seekBarWrapper.firstChild;
}

function getPlaybackPositionMarker(seekBarWrapper: HTMLElement): HTMLElement {
  return seekBarWrapper.querySelector('[class*="seekbar-playbackposition-marker"]');
}
