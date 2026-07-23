import { MockHelper, TestingPlayerAPI } from '../../helper/MockHelper';
import { UIInstanceManager } from '../../../src/ts/UIManager';
import { OverlayAdStatusOverlay } from '../../../src/ts/components/ads/OverlayAdStatusOverlay';
import { Button, ButtonConfig, ButtonStyle } from '../../../src/ts/components/buttons/Button';
import { DOM } from '../../../src/ts/DOM';

let playerMock: TestingPlayerAPI;
let uiInstanceManagerMock: UIInstanceManager;
let overlayAdStatusOverlay: OverlayAdStatusOverlay;
let uiContainerElementMock: jest.Mocked<DOM>;

describe('OverlayAdStatusOverlay', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    playerMock = MockHelper.getPlayerMock();
    (playerMock as any).ads = {
      skip: jest.fn(),
    } as any;
    uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();
    uiContainerElementMock = MockHelper.generateDOMMock();
    (uiInstanceManagerMock.getUI() as any).getDomElement = jest.fn().mockReturnValue(uiContainerElementMock);
    overlayAdStatusOverlay = new OverlayAdStatusOverlay({ skipDelay: 5000 });
    getSkipButton().initialize();
    overlayAdStatusOverlay.initialize();
    overlayAdStatusOverlay.configure(playerMock, uiInstanceManagerMock);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the badge on OverlayAdStarted and the skip button after the configured delay', () => {
    const skipButton = getSkipButton();

    expect(skipButton.getConfig().text).toBe('Dismiss');
    expect(skipButton.getConfig().buttonStyle).toBe(ButtonStyle.TextWithTrailingIcon);
    expect(overlayAdStatusOverlay.isHidden()).toBe(true);
    expect(skipButton.isHidden()).toBe(true);

    playerMock.eventEmitter.fireOverlayAdStartedEvent();

    expect(overlayAdStatusOverlay.isShown()).toBe(true);
    expect(skipButton.isHidden()).toBe(true);
    expect(uiContainerElementMock.addClass).toHaveBeenCalledWith(getOverlayAdActiveClass());

    jest.advanceTimersByTime(4999);
    expect(skipButton.isHidden()).toBe(true);

    jest.advanceTimersByTime(1);
    expect(skipButton.isShown()).toBe(true);
  });

  it('hides the overlay and skips the ad when the skip button is clicked', () => {
    const skipButton = getSkipButton();

    playerMock.eventEmitter.fireOverlayAdStartedEvent();
    jest.advanceTimersByTime(5000);

    (skipButton as any).onClickEvent();

    expect(playerMock.ads.skip).toHaveBeenCalled();
    expect(overlayAdStatusOverlay.isHidden()).toBe(true);
    expect(skipButton.isHidden()).toBe(true);
    expect(uiContainerElementMock.removeClass).toHaveBeenCalledWith(getOverlayAdActiveClass());
  });

  it('hides the overlay on SourceUnloaded', () => {
    const skipButton = getSkipButton();

    playerMock.eventEmitter.fireOverlayAdStartedEvent();
    jest.advanceTimersByTime(5000);

    playerMock.eventEmitter.fireSourceUnloadedEvent();

    expect(overlayAdStatusOverlay.isHidden()).toBe(true);
    expect(skipButton.isHidden()).toBe(true);
    expect(uiContainerElementMock.removeClass).toHaveBeenCalledWith(getOverlayAdActiveClass());
  });

  it('hides the overlay on OverlayAdFinished', () => {
    const skipButton = getSkipButton();

    playerMock.eventEmitter.fireOverlayAdStartedEvent();
    jest.advanceTimersByTime(5000);

    playerMock.eventEmitter.fireOverlayAdFinishedEvent();

    expect(overlayAdStatusOverlay.isHidden()).toBe(true);
    expect(skipButton.isHidden()).toBe(true);
    expect(uiContainerElementMock.removeClass).toHaveBeenCalledWith(getOverlayAdActiveClass());
  });

  it('clears overlay UI suppression on release', () => {
    playerMock.eventEmitter.fireOverlayAdStartedEvent();

    overlayAdStatusOverlay.release();

    expect(uiContainerElementMock.removeClass).toHaveBeenCalledWith(getOverlayAdActiveClass());
  });
});

function getSkipButton(): Button<ButtonConfig> {
  return overlayAdStatusOverlay.getConfig().components[1] as Button<ButtonConfig>;
}

function getOverlayAdActiveClass(): string {
  return (overlayAdStatusOverlay as any).prefixCss('overlay-ad-active');
}
