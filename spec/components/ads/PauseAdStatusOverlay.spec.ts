import { MockHelper, TestingPlayerAPI } from '../../helper/MockHelper';
import { UIInstanceManager, UIVariantIdentifier } from '../../../src/ts/UIManager';
import { PauseAdStatusOverlay } from '../../../src/ts/components/ads/PauseAdStatusOverlay';
import { Button, ButtonConfig, ButtonStyle } from '../../../src/ts/components/buttons/Button';
import { Label, LabelConfig } from '../../../src/ts/components/labels/Label';
import type { DOM } from '../../../src/ts/DOM';
import { defaultVocabularies, i18n } from '../../../src/ts/localization/i18n';
import { ComponentConfigManager } from '../../../src/ts/utils/ComponentConfigManager';
import type { UIComponentConfigOverrides } from '../../../src/ts/UIComponentConfigOverrides';

let playerMock: TestingPlayerAPI;
let uiInstanceManagerMock: UIInstanceManager;
let pauseAdStatusOverlay: PauseAdStatusOverlay;
let uiContainerElementMock: jest.Mocked<DOM>;

describe('PauseAdStatusOverlay', () => {
  beforeEach(() => {
    setupOverlay();
  });

  afterEach(() => {
    i18n.setConfig({ language: 'en', vocabularies: defaultVocabularies });
  });

  it('treats every non-linear ad as a pause ad while it is the only non-linear format', () => {
    playerMock.eventEmitter.fireNonLinearAdStartedEvent();

    expect(pauseAdStatusOverlay.isShown()).toBe(true);
    expect(uiContainerElementMock.addClass).toHaveBeenCalledWith(getPauseAdActiveClass());
  });

  describe('creative click catcher', () => {
    let windowOpen: jest.SpyInstance;

    beforeEach(() => {
      windowOpen = jest.spyOn(window, 'open').mockImplementation(() => null);
    });

    afterEach(() => {
      windowOpen.mockRestore();
    });

    it('is not focusable and is hidden from assistive technology', () => {
      const config = getClickCatcher().getConfig();

      expect(config.tabIndex).toBe(-1);
      expect(getClickCatcher().getDomElement().attr).toHaveBeenCalledWith('aria-hidden', 'true');
    });

    it('stays pointer-only when the base Button config is overridden', () => {
      setupOverlay({
        Button: {
          role: 'button',
          tabIndex: 0,
        },
      });

      const config = getClickCatcher().getConfig();
      expect(config.role).toBeNull();
      expect(config.tabIndex).toBe(-1);
    });

    it('stacks below the badge and the dismiss button', () => {
      const components = pauseAdStatusOverlay.getComponents();

      expect(components.indexOf(getClickCatcher())).toBeLessThan(components.indexOf(getBadgeLabel()));
      expect(components.indexOf(getClickCatcher())).toBeLessThan(components.indexOf(getDismissButton()));
    });

    it('opens the click-through and reports it to the ad exactly once', () => {
      const clickThroughUrlOpened = jest.fn();
      firePauseAdStarted({ clickThroughUrl: 'https://example.com', clickThroughUrlOpened });

      expect(getClickCatcher().isShown()).toBe(true);

      getClickCatcher()['onClickEvent']();

      expect(windowOpen).toHaveBeenCalledTimes(1);
      expect(windowOpen).toHaveBeenCalledWith('https://example.com', '_blank');
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

      playerMock.eventEmitter.fireNonLinearAdFinishedEvent({ id: 'pause-ad' });
      getClickCatcher()['onClickEvent']();

      expect(getClickCatcher().isHidden()).toBe(true);
      expect(windowOpen).not.toHaveBeenCalled();
      expect(clickThroughUrlOpened).not.toHaveBeenCalled();
    });

    it('does not run a captured click-through action after its ad is replaced', () => {
      const clickThroughUrlOpened = jest.fn();
      firePauseAdStarted({ clickThroughUrl: 'https://example.com', clickThroughUrlOpened });
      const action = pauseAdStatusOverlay.getClickThroughAction();
      expect(action).toBeDefined();

      firePauseAdStarted({ clickThroughUrl: 'https://example.com/next' });
      action();

      expect(windowOpen).not.toHaveBeenCalled();
      expect(clickThroughUrlOpened).not.toHaveBeenCalled();
    });
  });

  it('shows pause-ad status with the dismiss action available immediately', () => {
    const dismissButton = getDismissButton();

    expect(i18n.performLocalization(dismissButton.getConfig().text)).toBe('Close');
    expect(dismissButton.getConfig().buttonStyle).toBe(ButtonStyle.TextWithTrailingIcon);
    expect(pauseAdStatusOverlay.isHidden()).toBe(true);
    expect(dismissButton.isHidden()).toBe(true);

    firePauseAdStarted();

    expect(pauseAdStatusOverlay.isShown()).toBe(true);
    expect(dismissButton.isShown()).toBe(true);
    expect(uiContainerElementMock.addClass).toHaveBeenCalledWith(getPauseAdActiveClass());
  });

  it('localizes the default badge and dismiss text', () => {
    i18n.setConfig({ language: 'de', vocabularies: defaultVocabularies });

    expect(i18n.performLocalization(getBadgeLabel().getConfig().text)).toBe('Anzeige');
    expect(i18n.performLocalization(getDismissButton().getConfig().text)).toBe('Schließen');
  });

  it('skips the ad when Dismiss is clicked and hides the status once the skip is confirmed', () => {
    firePauseAdStarted({ id: 'pause-ad' });

    getDismissButton()['onClickEvent']();

    expect(playerMock.ads.skip).toHaveBeenCalled();
    expect(pauseAdStatusOverlay.isShown()).toBe(true);
    expect(getDismissButton().isShown()).toBe(true);

    playerMock.eventEmitter.fireNonLinearAdSkippedEvent({ id: 'pause-ad' });

    expect(pauseAdStatusOverlay.isHidden()).toBe(true);
    expect(getDismissButton().isHidden()).toBe(true);
    expect(uiContainerElementMock.removeClass).toHaveBeenCalledWith(getPauseAdActiveClass());
  });

  it('hides the pause-ad status on NonLinearAdFinished', () => {
    firePauseAdStarted({ id: 'pause-ad' });

    playerMock.eventEmitter.fireNonLinearAdFinishedEvent({ id: 'pause-ad' });

    expect(pauseAdStatusOverlay.isHidden()).toBe(true);
    expect(getDismissButton().isHidden()).toBe(true);
    expect(uiContainerElementMock.removeClass).toHaveBeenCalledWith(getPauseAdActiveClass());
  });

  it('hides the pause-ad status on NonLinearAdSkipped', () => {
    firePauseAdStarted({ id: 'pause-ad' });

    playerMock.eventEmitter.fireNonLinearAdSkippedEvent({ id: 'pause-ad' });

    expect(pauseAdStatusOverlay.isHidden()).toBe(true);
    expect(getDismissButton().isHidden()).toBe(true);
    expect(uiContainerElementMock.removeClass).toHaveBeenCalledWith(getPauseAdActiveClass());
  });

  it('ignores a terminal event for a different non-linear ad', () => {
    firePauseAdStarted({ id: 'pause-ad' });

    playerMock.eventEmitter.fireNonLinearAdFinishedEvent({ id: 'other-ad' });

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

function setupOverlay(componentConfigOverrides: UIComponentConfigOverrides = {}): void {
  playerMock = MockHelper.getPlayerMock();
  (playerMock as any).ads = {
    skip: jest.fn(),
  } as any;
  uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();
  uiContainerElementMock = MockHelper.generateDOMMock();
  (uiInstanceManagerMock.getUI() as any).getDomElement = jest.fn().mockReturnValue(uiContainerElementMock);
  pauseAdStatusOverlay = ComponentConfigManager.run(componentConfigOverrides, UIVariantIdentifier.main, () => {
    return new PauseAdStatusOverlay();
  });
  getClickCatcher().initialize();
  getDismissButton().initialize();
  pauseAdStatusOverlay.initialize();
  pauseAdStatusOverlay.configure(playerMock, uiInstanceManagerMock);
}

function firePauseAdStarted(adData: object = {}): void {
  playerMock.eventEmitter.fireNonLinearAdStartedEvent(adData);
}

function getClickCatcher(): Button<ButtonConfig> {
  return pauseAdStatusOverlay.getComponents()[0] as Button<ButtonConfig>;
}

function getBadgeLabel(): Label<LabelConfig> {
  return pauseAdStatusOverlay.getComponents()[1] as Label<LabelConfig>;
}

function getDismissButton(): Button<ButtonConfig> {
  return pauseAdStatusOverlay.getComponents()[2] as Button<ButtonConfig>;
}

function getPauseAdActiveClass(): string {
  return (pauseAdStatusOverlay as any).prefixCss('pause-ad-active');
}
