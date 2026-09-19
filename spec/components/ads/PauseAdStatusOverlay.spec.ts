import { MockHelper, TestingPlayerAPI } from '../../helper/MockHelper';
import { UIInstanceManager } from '../../../src/ts/UIManager';
import { PauseAdStatusOverlay } from '../../../src/ts/components/ads/PauseAdStatusOverlay';
import { Button, ButtonConfig, ButtonStyle } from '../../../src/ts/components/buttons/Button';
import type { DOM } from '../../../src/ts/DOM';

let playerMock: TestingPlayerAPI;
let uiInstanceManagerMock: UIInstanceManager;
let pauseAdStatusOverlay: PauseAdStatusOverlay;
let uiContainerElementMock: jest.Mocked<DOM>;

describe('PauseAdStatusOverlay', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    setupOverlay();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('treats every non-linear ad as a pause ad while it is the only non-linear format', () => {
    playerMock.eventEmitter.fireNonLinearAdStartedEvent();

    expect(pauseAdStatusOverlay.isShown()).toBe(true);
    expect(uiContainerElementMock.addClass).toHaveBeenCalledWith(getPauseAdActiveClass());
  });

  describe('creative click catcher', () => {
    it('is not focusable and carries no button semantics', () => {
      const config = getClickCatcher().getConfig();

      expect(config.tabIndex).toBe(-1);
      expect(config.role).toBeNull();
    });

    it('stacks below the badge and the dismiss button', () => {
      const components = pauseAdStatusOverlay.getConfig().components;

      expect(components.indexOf(getClickCatcher())).toBeLessThan(components.indexOf(getDismissButton()));
    });

    it('routes a click on the creative to the ad exactly once', () => {
      const clickThroughUrlOpened = jest.fn();
      firePauseAdStarted({ clickThroughUrl: 'https://example.com', clickThroughUrlOpened });

      expect(getClickCatcher().isShown()).toBe(true);

      (getClickCatcher() as any).onClickEvent();

      expect(clickThroughUrlOpened).toHaveBeenCalledTimes(1);
    });

    it('stays hidden when the ad carries no click-through destination', () => {
      const clickThroughUrlOpened = jest.fn();
      firePauseAdStarted({ clickThroughUrl: null, clickThroughUrlOpened });

      expect(pauseAdStatusOverlay.isShown()).toBe(true);
      expect(getClickCatcher().isHidden()).toBe(true);
    });

    it('stops routing clicks once the ad has finished', () => {
      const clickThroughUrlOpened = jest.fn();
      firePauseAdStarted({ id: 'pause-ad', clickThroughUrl: 'https://example.com', clickThroughUrlOpened });

      playerMock.eventEmitter.fireNonLinearAdFinishedEvent({}, { id: 'pause-ad' });
      (getClickCatcher() as any).onClickEvent();

      expect(getClickCatcher().isHidden()).toBe(true);
      expect(clickThroughUrlOpened).not.toHaveBeenCalled();
    });
  });

  it('shows pause-ad status with Dismiss available immediately', () => {
    const dismissButton = getDismissButton();

    expect(dismissButton.getConfig().text).toBe('Dismiss');
    expect(dismissButton.getConfig().buttonStyle).toBe(ButtonStyle.TextWithTrailingIcon);
    expect(pauseAdStatusOverlay.isHidden()).toBe(true);
    expect(dismissButton.isHidden()).toBe(true);

    firePauseAdStarted();

    expect(pauseAdStatusOverlay.isShown()).toBe(true);
    expect(dismissButton.isShown()).toBe(true);
    expect(uiContainerElementMock.addClass).toHaveBeenCalledWith(getPauseAdActiveClass());
  });

  it('shows pause-ad status for native non-linear ad started events', () => {
    playerMock.eventEmitter.fireNativeNonLinearAdStartedEvent();

    expect(pauseAdStatusOverlay.isShown()).toBe(true);
    expect(getDismissButton().isShown()).toBe(true);
    expect(uiContainerElementMock.addClass).toHaveBeenCalledWith(getPauseAdActiveClass());
  });

  it('focuses Dismiss when configured', () => {
    setupOverlay({ focusDismissButtonOnShow: true });
    const dismissDomElement = MockHelper.generateDOMMock();
    const dismissElement = { focus: jest.fn() } as unknown as HTMLElement;
    const focusSpy = jest.spyOn(dismissElement, 'focus');
    dismissDomElement.get.mockReturnValue(dismissElement);
    const getDomElementSpy = jest.spyOn(getDismissButton(), 'getDomElement').mockReturnValue(dismissDomElement);

    expect(focusSpy).not.toHaveBeenCalled();

    firePauseAdStarted();

    expect(getDismissButton().isShown()).toBe(true);
    expect(pauseAdStatusOverlay.getConfig().focusDismissButtonOnShow).toBe(true);
    expect(getDomElementSpy).toHaveBeenCalled();
    expect(focusSpy).toHaveBeenCalled();
  });

  it('hides the pause-ad status and skips the ad when Dismiss is clicked', () => {
    firePauseAdStarted();

    (getDismissButton() as any).onClickEvent();

    expect(playerMock.ads.skip).toHaveBeenCalled();
    expect(pauseAdStatusOverlay.isHidden()).toBe(true);
    expect(getDismissButton().isHidden()).toBe(true);
    expect(uiContainerElementMock.removeClass).toHaveBeenCalledWith(getPauseAdActiveClass());
  });

  it('hides the pause-ad status on NonLinearAdFinished', () => {
    firePauseAdStarted({ id: 'pause-ad' });

    playerMock.eventEmitter.fireNonLinearAdFinishedEvent({}, { id: 'pause-ad' });

    expect(pauseAdStatusOverlay.isHidden()).toBe(true);
    expect(getDismissButton().isHidden()).toBe(true);
    expect(uiContainerElementMock.removeClass).toHaveBeenCalledWith(getPauseAdActiveClass());
  });

  it('hides the pause-ad status on NonLinearAdSkipped', () => {
    firePauseAdStarted({ id: 'pause-ad' });

    playerMock.eventEmitter.fireNonLinearAdSkippedEvent({}, { id: 'pause-ad' });

    expect(pauseAdStatusOverlay.isHidden()).toBe(true);
    expect(getDismissButton().isHidden()).toBe(true);
    expect(uiContainerElementMock.removeClass).toHaveBeenCalledWith(getPauseAdActiveClass());
  });

  it('ignores a terminal event for a different non-linear ad', () => {
    firePauseAdStarted({ id: 'pause-ad' });

    playerMock.eventEmitter.fireNonLinearAdFinishedEvent({}, { id: 'other-ad' });

    expect(pauseAdStatusOverlay.isShown()).toBe(true);
  });

  it('hides the pause-ad status on SourceUnloaded', () => {
    firePauseAdStarted();

    playerMock.eventEmitter.fireSourceUnloadedEvent();

    expect(pauseAdStatusOverlay.isHidden()).toBe(true);
    expect(getDismissButton().isHidden()).toBe(true);
    expect(uiContainerElementMock.removeClass).toHaveBeenCalledWith(getPauseAdActiveClass());
  });

  it('clears pause-ad UI suppression on release', () => {
    firePauseAdStarted();

    pauseAdStatusOverlay.release();

    expect(uiContainerElementMock.removeClass).toHaveBeenCalledWith(getPauseAdActiveClass());
  });
});

function setupOverlay(config: { focusDismissButtonOnShow?: boolean } = {}): void {
  playerMock = MockHelper.getPlayerMock();
  (playerMock as any).ads = {
    skip: jest.fn(),
  } as any;
  uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();
  uiContainerElementMock = MockHelper.generateDOMMock();
  (uiInstanceManagerMock.getUI() as any).getDomElement = jest.fn().mockReturnValue(uiContainerElementMock);
  pauseAdStatusOverlay = new PauseAdStatusOverlay(config);
  getClickCatcher().initialize();
  getDismissButton().initialize();
  pauseAdStatusOverlay.initialize();
  pauseAdStatusOverlay.configure(playerMock, uiInstanceManagerMock);
}

function firePauseAdStarted(adData: object = {}): void {
  playerMock.eventEmitter.fireNonLinearAdStartedEvent({}, adData);
}

function getClickCatcher(): Button<ButtonConfig> {
  return pauseAdStatusOverlay.getConfig().components[0] as Button<ButtonConfig>;
}

function getDismissButton(): Button<ButtonConfig> {
  return pauseAdStatusOverlay.getConfig().components[2] as Button<ButtonConfig>;
}

function getPauseAdActiveClass(): string {
  return (pauseAdStatusOverlay as any).prefixCss('pause-ad-active');
}
