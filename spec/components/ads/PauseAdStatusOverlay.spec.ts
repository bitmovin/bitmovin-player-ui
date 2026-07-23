import { MockHelper, TestingPlayerAPI } from '../../helper/MockHelper';
import { UIInstanceManager } from '../../../src/ts/UIManager';
import { PauseAdStatusOverlay } from '../../../src/ts/components/ads/PauseAdStatusOverlay';
import { Button, ButtonConfig, ButtonStyle } from '../../../src/ts/components/buttons/Button';
import { DOM } from '../../../src/ts/DOM';

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

  it('ignores non-linear ads that are not positioned as pause ads', () => {
    playerMock.eventEmitter.fireNonLinearAdStartedEvent({ position: 'pre' });

    expect(pauseAdStatusOverlay.isHidden()).toBe(true);
    expect(getDismissButton().isHidden()).toBe(true);
    expect(uiContainerElementMock.addClass).not.toHaveBeenCalled();

    jest.advanceTimersByTime(4000);
    expect(getDismissButton().isHidden()).toBe(true);
  });

  it('shows pause-ad status and uses the four-second dismiss fallback', () => {
    const dismissButton = getDismissButton();

    expect(dismissButton.getConfig().text).toBe('Dismiss');
    expect(dismissButton.getConfig().buttonStyle).toBe(ButtonStyle.TextWithTrailingIcon);
    expect(pauseAdStatusOverlay.isHidden()).toBe(true);
    expect(dismissButton.isHidden()).toBe(true);

    firePauseAdStarted();

    expect(pauseAdStatusOverlay.isShown()).toBe(true);
    expect(dismissButton.isHidden()).toBe(true);
    expect(uiContainerElementMock.addClass).toHaveBeenCalledWith(getPauseAdActiveClass());

    jest.advanceTimersByTime(3999);
    expect(dismissButton.isHidden()).toBe(true);

    jest.advanceTimersByTime(1);
    expect(dismissButton.isShown()).toBe(true);
  });

  it('uses skippableAfter from the event instead of the fallback delay', () => {
    playerMock.eventEmitter.fireNonLinearAdStartedEvent({ position: 'pause', skippableAfter: 2 });

    jest.advanceTimersByTime(1999);
    expect(getDismissButton().isHidden()).toBe(true);

    jest.advanceTimersByTime(1);
    expect(getDismissButton().isShown()).toBe(true);
  });

  it('shows Dismiss immediately when skippableAfter is zero', () => {
    playerMock.eventEmitter.fireNonLinearAdStartedEvent({ position: 'pause' }, { skippableAfter: 0 });

    expect(getDismissButton().isShown()).toBe(true);
  });

  it('does not show Dismiss when skippableAfter is negative', () => {
    playerMock.eventEmitter.fireNonLinearAdStartedEvent(
      { adBreak: { position: 'pause', skippableAfter: -1 } },
      { id: 'pause-ad' },
    );

    jest.advanceTimersByTime(4000);

    expect(pauseAdStatusOverlay.isShown()).toBe(true);
    expect(getDismissButton().isHidden()).toBe(true);
  });

  it('uses the configured dismiss fallback when skippableAfter is missing', () => {
    setupOverlay({ dismissDelay: 2500 });

    firePauseAdStarted();
    jest.advanceTimersByTime(2499);
    expect(getDismissButton().isHidden()).toBe(true);

    jest.advanceTimersByTime(1);
    expect(getDismissButton().isShown()).toBe(true);
  });

  it('hides the pause-ad status and skips the ad when Dismiss is clicked', () => {
    firePauseAdStarted();
    jest.advanceTimersByTime(4000);

    (getDismissButton() as any).onClickEvent();

    expect(playerMock.ads.skip).toHaveBeenCalled();
    expect(pauseAdStatusOverlay.isHidden()).toBe(true);
    expect(getDismissButton().isHidden()).toBe(true);
    expect(uiContainerElementMock.removeClass).toHaveBeenCalledWith(getPauseAdActiveClass());
  });

  it('hides the pause-ad status on NonLinearAdFinished', () => {
    firePauseAdStarted({ id: 'pause-ad' });

    playerMock.eventEmitter.fireNonLinearAdFinishedEvent({ position: 'pause' }, { id: 'pause-ad' });

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

    playerMock.eventEmitter.fireNonLinearAdFinishedEvent({ position: 'pause' }, { id: 'other-ad' });

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

function setupOverlay(config: { dismissDelay?: number } = {}): void {
  playerMock = MockHelper.getPlayerMock();
  (playerMock as any).ads = {
    skip: jest.fn(),
  } as any;
  uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();
  uiContainerElementMock = MockHelper.generateDOMMock();
  (uiInstanceManagerMock.getUI() as any).getDomElement = jest.fn().mockReturnValue(uiContainerElementMock);
  pauseAdStatusOverlay = new PauseAdStatusOverlay(config);
  getDismissButton().initialize();
  pauseAdStatusOverlay.initialize();
  pauseAdStatusOverlay.configure(playerMock, uiInstanceManagerMock);
}

function firePauseAdStarted(adData: object = {}): void {
  playerMock.eventEmitter.fireNonLinearAdStartedEvent({ position: 'pause' }, adData);
}

function getDismissButton(): Button<ButtonConfig> {
  return pauseAdStatusOverlay.getConfig().components[1] as Button<ButtonConfig>;
}

function getPauseAdActiveClass(): string {
  return (pauseAdStatusOverlay as any).prefixCss('pause-ad-active');
}
