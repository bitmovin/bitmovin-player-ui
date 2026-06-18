import { RootNavigationGroup } from './RootNavigationGroup';
import { NodeEventSubscriber } from './NodeEventSubscriber';
import { Action, AnyComponent, Direction } from './types';
import { getBoundingRectFromElement } from './NavigationAlgorithm';
import { toHtmlElement } from './helper/toHtmlElement';

const DefaultScrubSpeedPercentage = 0.005;
const ScrubSpeedClearInterval = 100;
const ScrubSpeedMultiplier = 1.1;

/**
 * Handles Spatial Navigation interaction with the seek bar. Ensures, that seek operations can be executed and that the
 * scrubbing tooltip is shown as if the user scrubbed using the mouse/touchscreen.
 */
export class SeekBarHandler {
  private readonly cursorPosition = { x: 0, y: 0 };
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
      () => (this.scrubSpeedPercentage = DefaultScrubSpeedPercentage),
      ScrubSpeedClearInterval,
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
    const increment = this.getIncrement(direction, seekBarWrapper);
    // Use getBoundingRectFromElement (not getBoundingClientRect directly) so that `x` is also
    // populated on older TV browsers that only return `left`/`top` - same as initializeCursorPosition.
    const rect = getBoundingRectFromElement(seekBarWrapper);
    const minX = rect.x;
    const maxX = rect.x + rect.width;

    // Clamp the cursor position to the seek bar bounds. Without this, holding the remote in one
    // direction past the start/end keeps moving the (invisible) cursor beyond the seek bar, and the
    // user then has to "unwind" all that overshoot before scrubbing back the other way has any effect.
    this.cursorPosition.x = Math.min(Math.max(this.cursorPosition.x + increment, minX), maxX);
  }

  private initializeCursorPosition(seekBarWrapper: HTMLElement): void {
    const playbackPositionMarker = getPlaybackPositionMarker(seekBarWrapper);
    const rect = getBoundingRectFromElement(playbackPositionMarker);

    const startX = rect.x + rect.width / 2;
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

  private readonly onNavigation = (direction: Direction, target: AnyComponent, preventDefault: () => void): boolean => {
    const element = toHtmlElement(target);
    if (!isSeekBarWrapper(element)) {
      return false;
    }

    if (direction === Direction.UP || direction === Direction.DOWN) {
      this.stopSeeking(getSeekBar(element));

      return true;
    }

    this.initializeOrUpdateCursorPosition(element, direction);
    this.dispatchMouseMoveEvent(getSeekBar(element));

    preventDefault();

    return true;
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

  private readonly onAction = (action: Action, target: AnyComponent, preventDefault: () => void): boolean => {
    const element = toHtmlElement(target);
    if (!isSeekBarWrapper(element)) {
      return false;
    }

    const seekBar = getSeekBar(element);

    if (action === Action.SELECT && this.isScrubbing) {
      this.dispatchMouseClickEvent(seekBar);
      preventDefault();
      return true;
    } else if (action === Action.BACK && this.isScrubbing) {
      this.stopSeeking(seekBar);
      preventDefault();
      return true;
    }

    return false;
  };

  /**
   * Releases the SeekBraHandler, making sure all event subscribers are removed.
   */
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
