import { PauseAdStatusOverlay } from '../../src/ts/components/ads/PauseAdStatusOverlay';
import { PauseAdNavigationGroup } from '../../src/ts/spatialnavigation/PauseAdNavigationGroup';
import { Action } from '../../src/ts/spatialnavigation/types';
import { Button, ButtonConfig } from '../../src/ts/components/buttons/Button';
import { mockClass } from '../helper/mockClass';

// The base NavigationGroup is deliberately not mocked: which component it resolves as the first
// focus target is the behavior under test here.

describe('PauseAdNavigationGroup', () => {
  let pauseAdStatusOverlayMock: jest.Mocked<PauseAdStatusOverlay>;
  let dismissButton: Button<ButtonConfig>;
  let clickThroughButton: Button<ButtonConfig>;
  let secondaryButton: Button<ButtonConfig>;
  let pauseAdNavigationGroup: PauseAdNavigationGroup;

  beforeEach(() => {
    dismissButton = new Button({});
    pauseAdStatusOverlayMock = mockClass(PauseAdStatusOverlay);
    clickThroughButton = new Button({});
    (pauseAdStatusOverlayMock as { dismissButton: Button<ButtonConfig> }).dismissButton = dismissButton;
    (pauseAdStatusOverlayMock as { clickThroughButton: Button<ButtonConfig> }).clickThroughButton = clickThroughButton;
    pauseAdStatusOverlayMock.hide = jest.fn();
    secondaryButton = new Button({});

    pauseAdNavigationGroup = new PauseAdNavigationGroup(pauseAdStatusOverlayMock, secondaryButton);
  });

  it('should make the dismiss button the first focus target', () => {
    pauseAdNavigationGroup.focusFirstComponent();

    expect(pauseAdNavigationGroup.getActiveComponent()).toBe(dismissButton);
  });

  it.each([
    ['shown', true],
    ['hidden', false],
  ])('should include the click-through button as a focus target only while it is %s', (_, shown) => {
    jest.spyOn(clickThroughButton, 'isShown').mockReturnValue(shown);

    expect(pauseAdNavigationGroup['getComponents']().includes(clickThroughButton)).toBe(shown);
  });

  it('should keep the dismiss button as the first focus target when the click-through button is shown', () => {
    jest.spyOn(clickThroughButton, 'isShown').mockReturnValue(true);

    pauseAdNavigationGroup.focusFirstComponent();

    expect(pauseAdNavigationGroup.getActiveComponent()).toBe(dismissButton);
  });

  it('should forget the previous ad focus when its overlay is hidden', () => {
    pauseAdStatusOverlayMock.isShown.mockReturnValue(false);
    pauseAdNavigationGroup['activeComponent'] = secondaryButton;

    pauseAdNavigationGroup.disable();
    pauseAdNavigationGroup.enable();

    expect(pauseAdNavigationGroup.getActiveComponent()).toBe(dismissButton);
  });

  it('should restore focus when temporarily disabled during the same ad', () => {
    pauseAdStatusOverlayMock.isShown.mockReturnValue(true);
    pauseAdNavigationGroup['activeComponent'] = secondaryButton;

    pauseAdNavigationGroup.disable();
    pauseAdNavigationGroup.enable();

    expect(pauseAdNavigationGroup.getActiveComponent()).toBe(secondaryButton);
  });

  describe('when the click-through button is hidden', () => {
    it('should move the selection from the click-through button to the dismiss button', () => {
      const dismissClick = jest.fn();
      const clickThroughClick = jest.fn();
      dismissButton.onClick.subscribe(dismissClick);
      clickThroughButton.onClick.subscribe(clickThroughClick);
      pauseAdNavigationGroup['focusComponent'](clickThroughButton);

      clickThroughButton.hide();
      pauseAdNavigationGroup.handleAction(Action.SELECT);

      expect(pauseAdNavigationGroup.getActiveComponent()).toBe(dismissButton);
      expect(clickThroughClick).not.toHaveBeenCalled();
      expect(dismissClick).toHaveBeenCalledTimes(1);
    });

    it('should not move the selection to a dismiss button that is hidden as well', () => {
      pauseAdNavigationGroup['focusComponent'](clickThroughButton);
      dismissButton.hide();

      clickThroughButton.hide();

      expect(pauseAdNavigationGroup.getActiveComponent()).toBe(clickThroughButton);
    });

    it('should restore the dismiss button instead of a click-through button saved while another group was active', () => {
      pauseAdStatusOverlayMock.isShown.mockReturnValue(true);
      pauseAdNavigationGroup['focusComponent'](clickThroughButton);
      pauseAdNavigationGroup.disable();

      clickThroughButton.hide();
      pauseAdNavigationGroup.enable();

      expect(pauseAdNavigationGroup.getActiveComponent()).toBe(dismissButton);
    });

    it('should keep a different saved target', () => {
      pauseAdStatusOverlayMock.isShown.mockReturnValue(true);
      pauseAdNavigationGroup['activeComponent'] = secondaryButton;
      pauseAdNavigationGroup.disable();

      clickThroughButton.hide();
      pauseAdNavigationGroup.enable();

      expect(pauseAdNavigationGroup.getActiveComponent()).toBe(secondaryButton);
    });

    it('should stop reacting once the group is released', () => {
      pauseAdNavigationGroup['focusComponent'](clickThroughButton);
      pauseAdNavigationGroup.release();
      const focusSpy = jest.spyOn(pauseAdNavigationGroup as any, 'focusComponent');

      clickThroughButton.hide();

      expect(focusSpy).not.toHaveBeenCalled();
    });
  });

  describe('defaultActionHandler', () => {
    it('should not handle Action.BACK, so the overlay stays while the creative is showing', () => {
      const handled = pauseAdNavigationGroup['defaultActionHandler'](Action.BACK);

      expect(pauseAdStatusOverlayMock.hide).not.toHaveBeenCalled();
      expect(handled).toBe(false);
    });
  });
});
