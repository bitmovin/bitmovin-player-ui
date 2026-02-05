import { JSDOM } from 'jsdom';
import { FocusVisibilityTracker } from '../../src/ts/utils/FocusVisibilityTracker';
import { MockHelper } from '../helper/MockHelper';
import { DOM } from '../../src/ts/DOM';

describe('FocusVisibilityTracker', () => {
  const bitmovinUIPrefix = 'bmpui';
  const uiButtonId = `${bitmovinUIPrefix}-some-button`;
  const nonUiButtonId = 'some-button';
  const focusVisibileClassName = '{{PREFIX}}-focus-visible';
  let uiButton: HTMLElement;
  let nonUiButton: HTMLElement;
  let tracker: FocusVisibilityTracker;
  let uiWrapperElement: DOM;

  beforeEach(() => {
    const { window } = new JSDOM();
    global.document = window.document;
    uiButton = createAndAddButton(document, uiButtonId);
    nonUiButton = createAndAddButton(document, nonUiButtonId);
    uiWrapperElement = new DOM(global.document);
    tracker = new FocusVisibilityTracker(bitmovinUIPrefix, uiWrapperElement);
  });

  it('adds the focus-visible class on a UI button that gets focus w/o initial interaction', () => {
    // Initially, the last interaction is set to keyboard. To cover the case of hitting TAB from the address bar which would
    // not trigger a keydown event.
    uiButton.focus();

    expect(uiButton.classList.contains(focusVisibileClassName)).toBe(true);
    expect(nonUiButton.classList.contains(focusVisibileClassName)).toBe(false);
  });

  it('adds the focus-visible class on a UI button that gets focus after a keydown event', () => {
    dispatchEvent(document, 'MouseEvent', 'mousedown');
    dispatchEvent(document, 'KeyboardEvent', 'keydown');

    uiButton.focus();

    expect(uiButton.classList.contains(focusVisibileClassName)).toBe(true);
    expect(nonUiButton.classList.contains(focusVisibileClassName)).toBe(false);
  });

  // TODO: Add '${'PointerEvent'} | ${'pointerdown'}' once fixed in jsdom, see
  // https://github.com/jsdom/jsdom/issues/2527
  test.each`
    eventInterface  | eventType
    ${'MouseEvent'} | ${'mousedown'}
    ${'TouchEvent'} | ${'touchstart'}
  `(
    'does not add the focus-visible class on a UI button that gets focus after a $eventType event',
    ({ eventInterface, eventType }) => {
      dispatchEvent(document, eventInterface, eventType);

      uiButton.focus();

      expect(uiButton.classList.contains(focusVisibileClassName)).toBe(false);
      expect(nonUiButton.classList.contains(focusVisibileClassName)).toBe(false);
    },
  );

  it('removes the focus-visible class on a UI button once it loses focus', () => {
    uiButton.focus();

    uiButton.blur();

    expect(uiButton.classList.contains(focusVisibileClassName)).toBe(false);
    expect(nonUiButton.classList.contains(focusVisibileClassName)).toBe(false);
  });

  it('removes event listeners upon release', () => {
    const spy = jest.spyOn(uiWrapperElement, 'off');
    expect(spy).toHaveBeenCalledTimes(0);

    tracker.release();

    expect(spy).toHaveBeenCalledTimes(6);
  });
});

function createAndAddButton(document: Document, id: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.id = id;
  document.body.appendChild(button);
  return button;
}

function dispatchEvent(document: Document, eventInterface: string, eventType: string): void {
  const event = document.createEvent(eventInterface);
  event.initEvent(eventType);
  document.dispatchEvent(event);
}
