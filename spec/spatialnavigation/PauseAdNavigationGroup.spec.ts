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
  let secondaryButton: Button<ButtonConfig>;
  let pauseAdNavigationGroup: PauseAdNavigationGroup;

  beforeEach(() => {
    dismissButton = new Button({});
    pauseAdStatusOverlayMock = mockClass(PauseAdStatusOverlay);
    (pauseAdStatusOverlayMock as { dismissButton: Button<ButtonConfig> }).dismissButton = dismissButton;
    pauseAdStatusOverlayMock.hide = jest.fn();
    secondaryButton = new Button({});

    pauseAdNavigationGroup = new PauseAdNavigationGroup(pauseAdStatusOverlayMock, secondaryButton);
  });

  it('should make the dismiss button the first focus target', () => {
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

  describe('defaultActionHandler', () => {
    it('should not handle Action.BACK, so the overlay stays while the creative is showing', () => {
      const handled = pauseAdNavigationGroup['defaultActionHandler'](Action.BACK);

      expect(pauseAdStatusOverlayMock.hide).not.toHaveBeenCalled();
      expect(handled).toBe(false);
    });
  });
});
