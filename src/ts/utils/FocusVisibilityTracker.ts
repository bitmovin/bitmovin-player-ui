import { DOM } from '../DOM';

const FocusVisibleCssClassName = '{{PREFIX}}-focus-visible';

export class FocusVisibilityTracker {
  private readonly eventHandlerMap: { [eventName: string]: EventListenerOrEventListenerObject };
  private lastInteractionWasKeyboard: boolean = true;
  private uiWrapperElement: DOM;

  constructor(
    private bitmovinUiPrefix: string,
    uiWrapperElement: DOM,
  ) {
    this.uiWrapperElement = uiWrapperElement;
    this.eventHandlerMap = {
      mousedown: this.onMouseOrPointerOrTouch,
      pointerdown: this.onMouseOrPointerOrTouch,
      touchstart: this.onMouseOrPointerOrTouch,
      keydown: this.onKeyDown,
      focus: this.onFocus,
      blur: this.onBlur,
    };
    this.registerEventListeners();
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.metaKey || e.altKey || e.ctrlKey) {
      return;
    }

    this.lastInteractionWasKeyboard = true;
    // Switching to the keyboard on a control focused by a pointer makes its focus visible, like :focus-visible
    this.markFocusVisible(e.target);
  };

  private onMouseOrPointerOrTouch = () => (this.lastInteractionWasKeyboard = false);

  private onFocus = ({ target: element }: FocusEvent) => {
    if (this.lastInteractionWasKeyboard) {
      this.markFocusVisible(element);
    }
  };

  private markFocusVisible(element: EventTarget | null): void {
    if (
      isHtmlElement(element) &&
      isBitmovinUi(element, this.bitmovinUiPrefix) &&
      !element.classList.contains(FocusVisibleCssClassName)
    ) {
      element.classList.add(FocusVisibleCssClassName);
    }
  }

  private onBlur = ({ target: element }: FocusEvent) => {
    if (isHtmlElement(element)) {
      element.classList.remove(FocusVisibleCssClassName);
    }
  };

  private registerEventListeners(): void {
    for (const event in this.eventHandlerMap) {
      this.uiWrapperElement.on(event, this.eventHandlerMap[event], true);
    }
  }

  private unregisterEventListeners(): void {
    for (const event in this.eventHandlerMap) {
      this.uiWrapperElement.off(event, this.eventHandlerMap[event], true);
    }
  }

  public release(): void {
    this.unregisterEventListeners();
  }
}

/**
 * Checks whether an element shows a visible focus indicator, i.e. it was focused by keyboard (or spatial navigation)
 * rather than by a pointer. The {@link FocusVisibilityTracker} of the UI decides this when the element receives focus,
 * so this answers correctly in `focusin` handlers, which run after the `focus` event the tracker listens to.
 */
export function hasVisibleFocus(element: EventTarget | null): boolean {
  return isHtmlElement(element) && element.classList.contains(FocusVisibleCssClassName);
}

function isBitmovinUi(element: Element, bitmovinUiPrefix: string): boolean {
  return element.id.indexOf(bitmovinUiPrefix) === 0;
}

function isHtmlElement(element: unknown): element is HTMLElement & { classList: DOMTokenList } {
  return element instanceof HTMLElement && element.classList instanceof DOMTokenList;
}
