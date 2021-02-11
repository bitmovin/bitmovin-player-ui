const FocusVisibleCssClassName = '{{PREFIX}}-focus-visible';

export class FocusVisibilityTracker {
  private readonly eventHandlerMap: { [eventName: string]: EventListenerOrEventListenerObject };
  private lastInteractionWasKeyboard: boolean = true;

  constructor(document: Document, private bitmovinUiPrefix: string) {
    this.eventHandlerMap = {
      mousedown: this.onMouseOrPointerOrTouch,
      pointerdown: this.onMouseOrPointerOrTouch,
      touchstart: this.onMouseOrPointerOrTouch,
      keydown: this.onKeyDown,
      focus: this.onFocus,
      blur: this.onBlur,
    };
    this.registerEventListeners(document);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.metaKey || e.altKey || e.ctrlKey) {
      return;
    }

    this.lastInteractionWasKeyboard = true;
  };

  private onMouseOrPointerOrTouch = () => (this.lastInteractionWasKeyboard = false);

  private onFocus = ({ target: element }: FocusEvent) => {
    if (
      this.lastInteractionWasKeyboard &&
      isHtmlElement(element) &&
      isBitmovinUi(element, this.bitmovinUiPrefix) &&
      !element.classList.contains(FocusVisibleCssClassName)
    ) {
      element.classList.add(FocusVisibleCssClassName);
    }
  };

  private onBlur = ({ target: element }: FocusEvent) => {
    if (isHtmlElement(element)) {
      element.classList.remove(FocusVisibleCssClassName);
    }
  };

  private registerEventListeners(document: Document): void {
    for (const event in this.eventHandlerMap) {
      document.addEventListener(event, this.eventHandlerMap[event], true);
    }
  }

  private unregisterEventListeners(): void {
    for (const event in this.eventHandlerMap) {
      document.removeEventListener(event, this.eventHandlerMap[event], true);
    }
  }

  public release(): void {
    this.unregisterEventListeners();
  }
}

function isBitmovinUi(element: Element, bitmovinUiPrefix: string): boolean {
  return element.id.indexOf(bitmovinUiPrefix) === 0;
}

function isHtmlElement(element: unknown): element is Element & { classList: DOMTokenList } {
  return (
    element instanceof HTMLElement && element.classList instanceof DOMTokenList
  );
}
