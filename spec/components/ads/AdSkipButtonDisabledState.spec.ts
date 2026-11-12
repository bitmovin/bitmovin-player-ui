import { MockHelper, TestingPlayerAPI } from '../../helper/MockHelper';
import { UIInstanceManager } from '../../../src/ts/UIManager';
import { AdSkipButton } from '../../../src/ts/components/ads/AdSkipButton';

let playerMock: TestingPlayerAPI;
let uiInstanceManagerMock: UIInstanceManager;
let adSkipButton: AdSkipButton;
let attributes: Map<string, string>;

describe('AdSkipButton disabled state', () => {
  const skippableAfter = 5;

  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();

    // Track attributes on the DOM mock so the resulting accessible state can be asserted
    attributes = new Map<string, string>();
    const mockDomElement = MockHelper.generateDOMMock();
    mockDomElement.attr.mockImplementation((name: string, value: string) => {
      attributes.set(name, value);
      return mockDomElement;
    });
    mockDomElement.removeAttr.mockImplementation((name: string) => attributes.delete(name));
    mockDomElement.find = jest.fn().mockReturnValue(MockHelper.generateDOMMock());

    adSkipButton = new AdSkipButton();
    jest.spyOn(adSkipButton, 'getDomElement').mockReturnValue(mockDomElement);
    adSkipButton.configure(playerMock, uiInstanceManagerMock);
  });

  it.each([
    { currentTime: 0, expectedAriaDisabled: 'true' },
    { currentTime: skippableAfter - 1, expectedAriaDisabled: 'true' },
    { currentTime: skippableAfter, expectedAriaDisabled: undefined },
    { currentTime: skippableAfter + 1, expectedAriaDisabled: undefined },
  ])(
    'should set aria-disabled to $expectedAriaDisabled at playback time $currentTime',
    ({ currentTime, expectedAriaDisabled }) => {
      jest.spyOn(playerMock, 'getCurrentTime').mockReturnValue(currentTime);

      playerMock.eventEmitter.fireAdStartedEvent({ skippableAfter });

      expect(attributes.get('aria-disabled')).toBe(expectedAriaDisabled);
    },
  );

  it('should remove aria-disabled once the countdown has finished', () => {
    const getCurrentTimeSpy = jest.spyOn(playerMock, 'getCurrentTime').mockReturnValue(0);
    playerMock.eventEmitter.fireAdStartedEvent({ skippableAfter });

    getCurrentTimeSpy.mockReturnValue(skippableAfter);
    playerMock.eventEmitter.fireTimeChangedEvent(skippableAfter);

    expect(adSkipButton.isEnabled()).toBe(true);
    expect(attributes.has('aria-disabled')).toBe(false);
  });

  it('should keep the button focusable while the countdown is running', () => {
    jest.spyOn(playerMock, 'getCurrentTime').mockReturnValue(0);

    playerMock.eventEmitter.fireAdStartedEvent({ skippableAfter });

    expect(attributes.has('disabled')).toBe(false);
  });
});
