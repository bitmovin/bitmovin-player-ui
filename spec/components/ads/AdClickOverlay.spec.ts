import { AdClickOverlay } from '../../../src/ts/components/ads/AdClickOverlay';
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

  function getElement(): HTMLElement {
    return adClickOverlay.getDomElement().get(0);
  }

  function expectHiddenFromKeyboardAndAssistiveTechnology(): void {
    expect(getElement().getAttribute('tabindex')).toBe('-1');
    expect(getElement().getAttribute('aria-hidden')).toBe('true');
  }
});
