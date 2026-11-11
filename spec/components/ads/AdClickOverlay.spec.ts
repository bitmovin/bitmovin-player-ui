import { AdClickOverlay } from '../../../src/ts/components/ads/AdClickOverlay';
import { UIContainer } from '../../../src/ts/components/UIContainer';
import { isFocusable } from '../../../src/ts/spatialnavigation/TypeGuards';
import type { UIInstanceManager } from '../../../src/ts/UIManager';
import { MockHelper, TestingPlayerAPI } from '../../helper/MockHelper';

let playerMock: TestingPlayerAPI;
let uiInstanceManagerMock: UIInstanceManager;
let adClickOverlay: AdClickOverlay;

describe('AdClickOverlay', () => {
  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();

    adClickOverlay = new AdClickOverlay();
    adClickOverlay.initialize();
    adClickOverlay.configure(playerMock, uiInstanceManagerMock);
  });

  it('should have an accessible name that describes the click-through', () => {
    expect(getElement().getAttribute('aria-label')).toBe('Learn more about this ad, opens in a new tab');
  });

  it('should not be focusable or exposed to assistive technology before an ad starts', () => {
    expectHiddenFromKeyboardAndAssistiveTechnology();
  });

  it('should be focusable and exposed to assistive technology when the ad has a click-through URL', () => {
    playerMock.eventEmitter.fireAdStartedEvent({ clickThroughUrl: 'https://example.com' });

    expect(getElement().getAttribute('tabindex')).toBe('0');
    expect(getElement().hasAttribute('aria-hidden')).toBe(false);
  });

  it('should stay hidden from keyboard and assistive technology when the ad has no click-through URL', () => {
    playerMock.eventEmitter.fireAdStartedEvent({ clickThroughUrl: undefined });

    expectHiddenFromKeyboardAndAssistiveTechnology();
  });

  it.each`
    event           | fireEvent
    ${'AdFinished'} | ${() => playerMock.eventEmitter.fireEvent({ timestamp: Date.now(), type: playerMock.exports.PlayerEvent.AdFinished })}
    ${'AdSkipped'}  | ${() => playerMock.eventEmitter.fireAdSkippedEvent()}
    ${'AdError'}    | ${() => playerMock.eventEmitter.fireAdErrorEvent()}
  `(
    'should hide again from keyboard and assistive technology on $event',
    ({ fireEvent }: { fireEvent: () => void }) => {
      playerMock.eventEmitter.fireAdStartedEvent({ clickThroughUrl: 'https://example.com' });

      fireEvent();

      expectHiddenFromKeyboardAndAssistiveTechnology();
    },
  );

  it.each`
    adStartedWith                                 | expectedFocusable
    ${undefined}                                  | ${false}
    ${{ clickThroughUrl: 'https://example.com' }} | ${true}
    ${{ clickThroughUrl: undefined }}             | ${false}
  `(
    'should report focusable as $expectedFocusable to spatial navigation for ad $adStartedWith',
    ({ adStartedWith, expectedFocusable }) => {
      if (adStartedWith) {
        playerMock.eventEmitter.fireAdStartedEvent(adStartedWith);
      }

      expect(isFocusable(adClickOverlay)).toBe(expectedFocusable);
    },
  );

  it('should become focusable for spatial navigation again when a later ad has a click-through URL', () => {
    playerMock.eventEmitter.fireAdStartedEvent({ clickThroughUrl: undefined });
    playerMock.eventEmitter.fireAdStartedEvent({ clickThroughUrl: 'https://example.com' });

    expect(isFocusable(adClickOverlay)).toBe(true);
    expect(getElement().getAttribute('tabindex')).toBe('0');
  });

  it('should still pause the ad on pointer click when there is no click-through URL', () => {
    const pauseSpy = jest.spyOn(playerMock, 'pause');
    playerMock.eventEmitter.fireAdStartedEvent({ clickThroughUrl: undefined });

    getElement().click();

    expect(pauseSpy).toHaveBeenCalledWith('ui-ad-click-overlay');
  });

  describe('when focused and the next ad has no click-through URL', () => {
    let uiContainer: UIContainer;

    beforeEach(() => {
      uiContainer = new UIContainer({ components: [] });
      jest.spyOn(uiInstanceManagerMock, 'getUI').mockReturnValue(uiContainer);
      document.body.appendChild(getElement());

      playerMock.eventEmitter.fireAdStartedEvent({ clickThroughUrl: 'https://example.com' });
      getElement().focus();
      expect(document.activeElement).toBe(getElement());
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should move the focus to the UI container', () => {
      document.body.appendChild(uiContainer.getDomElement().get(0));

      playerMock.eventEmitter.fireAdStartedEvent({ clickThroughUrl: undefined });

      expect(document.activeElement).toBe(uiContainer.getDomElement().get(0));
      expectHiddenFromKeyboardAndAssistiveTechnology();
    });

    it('should blur the overlay if the UI container cannot take the focus', () => {
      // The UI container is not attached to the document, so it cannot be focused
      playerMock.eventEmitter.fireAdStartedEvent({ clickThroughUrl: undefined });

      expect(document.activeElement).not.toBe(getElement());
      expectHiddenFromKeyboardAndAssistiveTechnology();
    });
  });

  function getElement(): HTMLElement {
    return adClickOverlay.getDomElement().get(0);
  }

  function expectHiddenFromKeyboardAndAssistiveTechnology(): void {
    expect(getElement().getAttribute('tabindex')).toBe('-1');
    expect(getElement().getAttribute('aria-hidden')).toBe('true');
  }
});
