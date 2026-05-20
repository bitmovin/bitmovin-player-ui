import {
  InternalUIConfig,
  PlayerWrapper,
  UIConditionContext,
  UIInstanceManager,
  UIManager,
  UIVariant,
} from '../src/ts/UIManager';
import { PlayerAPI, PlayerEvent } from 'bitmovin-player';
import { MockHelper, TestingPlayerAPI } from './helper/MockHelper';
import { MobileV3PlayerEvent } from '../src/ts/utils/MobileV3PlayerAPI';
import { UIContainer } from '../src/ts/components/UIContainer';
import { Container } from '../src/ts/components/Container';

jest.mock('../src/ts/DOM');

// This just simulates a Class that can be wrapped by our PlayerWrapper.
// To enable this simple class structure we need a lot of any casts in the tests.
class A {
  private value?: object = undefined;

  get a() {
    return this.value;
  }

  // This is needed to change the actual value of the property
  giveValueAValue() {
    this.value = { foo: 'bar' };
  }
}

class B extends A {
  get b() {
    return {};
  }
}

class C extends B {
  get c() {
    return {};
  }
}

describe('UIManager', () => {
  describe('PlayerWrapper', () => {
    let playerWrapper: PlayerWrapper;

    describe('without inheritance', () => {
      let superClassInstance: A;

      beforeEach(() => {
        const testInstance: PlayerAPI = new A() as any as PlayerAPI;
        playerWrapper = new PlayerWrapper(testInstance);
        (testInstance as any).giveValueAValue(); // Change the value of the actual property to simulate async loaded module
        superClassInstance = playerWrapper.getPlayer() as any as A;
      });

      it('wraps functions', () => {
        expect(superClassInstance.a).not.toBeUndefined();
      });
    });

    describe('with inheritance', () => {
      let inheritedClassInstance: C;

      beforeEach(() => {
        const testInstance: PlayerAPI = new C() as any as PlayerAPI;
        playerWrapper = new PlayerWrapper(testInstance);
        (testInstance as any).giveValueAValue(); // Change the value of the actual property to simulate async loaded module
        inheritedClassInstance = playerWrapper.getPlayer() as any as C;
      });

      it('wraps functions of super class', () => {
        expect(inheritedClassInstance.a).not.toBeUndefined();
      });
    });
  });

  describe('switchToUiVariant', () => {
    let firstUi: UIVariant, secondUI: UIVariant, defaultUI: UIVariant;
    let playerMock: TestingPlayerAPI;

    beforeEach(() => {
      playerMock = MockHelper.getPlayerMock();
      firstUi = {
        ui: new UIContainer({ components: [new Container({})] }),
        condition: context => context.isPlaying,
      };
      secondUI = {
        ui: new UIContainer({ components: [new Container({})] }),
        condition: context => context.isAd,
      };
      defaultUI = {
        ui: new UIContainer({ components: [new Container({})] }),
      };
    });

    it('should mark invisible UIs as hidden', () => {
      new UIManager(playerMock, [firstUi, secondUI, defaultUI]);

      expect(firstUi.ui.isHidden()).toBeTruthy();
      expect(secondUI.ui.isHidden()).toBeTruthy();
      expect(defaultUI.ui.isHidden()).toBeFalsy();
    });

    it('should switch to the corresponding ui when a play event is fired', () => {
      new UIManager(playerMock, [firstUi, secondUI, defaultUI]);

      (playerMock.isPlaying as jest.Mock).mockReturnValue(true);
      playerMock.eventEmitter.firePlayEvent();

      expect(firstUi.ui.isHidden()).toBeFalsy();
      expect(secondUI.ui.isHidden()).toBeTruthy();
      expect(defaultUI.ui.isHidden()).toBeTruthy();
    });

    it('should dispatch the onActiveUiChanged event', () => {
      const onUiChanged = jest.fn();
      const uiManager = new UIManager(playerMock, [firstUi, secondUI, defaultUI]);

      uiManager.switchToUiVariant(firstUi);
      uiManager.onActiveUiChanged.subscribe(onUiChanged);
      uiManager.switchToUiVariant(secondUI);

      expect(onUiChanged).toHaveBeenCalledWith(uiManager, {
        previousUi: uiManager['uiInstanceManagers'][0],
        currentUi: uiManager['uiInstanceManagers'][1],
      });
    });

    it('should not dispatch the onActiveUiChanged event if the selected variant is already active', () => {
      const onUiChanged = jest.fn();
      const uiManager = new UIManager(playerMock, [firstUi, secondUI, defaultUI]);

      uiManager.switchToUiVariant(firstUi);
      uiManager.onActiveUiChanged.subscribe(onUiChanged);
      uiManager.switchToUiVariant(firstUi);

      expect(onUiChanged).not.toHaveBeenCalled();
    });

    it('should not dispatch the onActiveUiChanged event if the selected variant is not yet set up', () => {
      const onUiChanged = jest.fn();
      const uiManager = new UIManager(playerMock, [firstUi, defaultUI]);

      uiManager.switchToUiVariant(firstUi);
      uiManager.onActiveUiChanged.subscribe(onUiChanged);
      uiManager.switchToUiVariant(secondUI);

      expect(onUiChanged).not.toHaveBeenCalled();
    });
  });

  describe('ui variant resolution', () => {
    it('keeps the ad UI active when SourceLoaded fires during an active ad', () => {
      const playerMock = MockHelper.getPlayerMock();
      const adUi = {
        ui: new UIContainer({ components: [new Container({})] }),
        condition: (context: UIConditionContext) => context.isAd,
      };
      const contentUi = {
        ui: new UIContainer({ components: [new Container({})] }),
        condition: (context: UIConditionContext) => context.isSourceLoaded,
      };
      const defaultUi = { ui: new UIContainer({ components: [new Container({})] }) };

      new UIManager(playerMock, [adUi, contentUi, defaultUi]);

      playerMock.eventEmitter.fireAdStartedEvent();
      expect(adUi.ui.isHidden()).toBeFalsy();
      expect(contentUi.ui.isHidden()).toBeTruthy();

      playerMock.eventEmitter.fireSourceLoadedEvent();
      expect(adUi.ui.isHidden()).toBeFalsy();
      expect(contentUi.ui.isHidden()).toBeTruthy();

      playerMock.eventEmitter.fireAdBreakFinishedEvent();
      expect(adUi.ui.isHidden()).toBeTruthy();
      expect(contentUi.ui.isHidden()).toBeFalsy();
    });
  });

  describe('auto-release on player Destroy', () => {
    it('calls release() when the player fires the Destroy event', () => {
      const playerMock = MockHelper.getPlayerMock();
      const uiVariant = { ui: new UIContainer({ components: [new Container({})] }) };
      const uiManager = new UIManager(playerMock, [uiVariant]);
      const releaseSpy = jest.spyOn(uiManager, 'release');

      playerMock.eventEmitter.fireEvent({ timestamp: Date.now(), type: PlayerEvent.Destroy });

      expect(releaseSpy).toHaveBeenCalledTimes(1);
    });

    it('is idempotent across auto- and manual release calls', () => {
      const playerMock = MockHelper.getPlayerMock();
      const uiVariant = { ui: new UIContainer({ components: [new Container({})] }) };
      const uiManager = new UIManager(playerMock, [uiVariant]);
      const adBreakTrackerReleaseSpy = jest.spyOn(
        (uiManager.getConfig() as InternalUIConfig).adBreakTracker,
        'release',
      );
      const wrapperClearSpy = jest.spyOn(
        (uiManager as any).managerPlayerWrapper as PlayerWrapper,
        'clearEventHandlers',
      );

      playerMock.eventEmitter.fireEvent({ timestamp: Date.now(), type: PlayerEvent.Destroy });
      uiManager.release();
      uiManager.release();
      uiManager.release();

      expect(adBreakTrackerReleaseSpy).toHaveBeenCalledTimes(1);
      expect(wrapperClearSpy).toHaveBeenCalledTimes(1);
    });

    it('swallows PlayerAPINotAvailableError thrown from releaseControls but rethrows other errors', () => {
      const playerMock = MockHelper.getPlayerMock();
      const uiVariant1 = { ui: new UIContainer({ components: [new Container({})] }) };
      const uiManager1 = new UIManager(playerMock, [uiVariant1]);
      jest.spyOn(uiManager1.activeUi as any, 'releaseControls').mockImplementation(() => {
        throw new playerMock.exports.PlayerAPINotAvailableError('player.foo');
      });

      expect(() => uiManager1.release()).not.toThrow();

      const playerMock2 = MockHelper.getPlayerMock();
      const uiVariant2 = { ui: new UIContainer({ components: [new Container({})] }) };
      const uiManager2 = new UIManager(playerMock2, [uiVariant2]);
      jest.spyOn(uiManager2.activeUi as any, 'releaseControls').mockImplementation(() => {
        throw new TypeError('boom from a custom component');
      });

      expect(() => uiManager2.release()).toThrow(TypeError);
    });

    it('forwards .off() calls from both manager-level and per-instance wrappers to the same underlying player', () => {
      const playerMock = MockHelper.getPlayerMock();
      const uiVariant = { ui: new UIContainer({ components: [new Container({})] }) };
      const uiManager = new UIManager(playerMock, [uiVariant]);
      const offSpy = jest.spyOn(playerMock, 'off');

      const managerWrapped = (uiManager as any).managerPlayerWrapper.getPlayer() as PlayerAPI;
      const instanceWrapped = uiManager.activeUi.getPlayer();

      const cb = () => {};
      managerWrapped.on(PlayerEvent.Play, cb);
      instanceWrapped.on(PlayerEvent.Play, cb);
      managerWrapped.off(PlayerEvent.Play, cb);
      instanceWrapped.off(PlayerEvent.Play, cb);

      expect(offSpy).toHaveBeenCalledTimes(2);
      expect(offSpy).toHaveBeenNthCalledWith(1, PlayerEvent.Play, cb);
      expect(offSpy).toHaveBeenNthCalledWith(2, PlayerEvent.Play, cb);
    });
  });

  describe('activeUi', () => {
    it('should return the active UI instance manager', () => {
      const playerMock = MockHelper.getPlayerMock();
      const uiVariant = { ui: new UIContainer({ components: [new Container({})] }) };
      const uiManager = new UIManager(playerMock, [uiVariant]);

      expect(uiManager.activeUi).toBeInstanceOf(UIInstanceManager);
    });
  });

  describe('mobile v3 handling', () => {
    let playerMock: TestingPlayerAPI;
    beforeEach(() => {
      playerMock = MockHelper.getPlayerMock();

      // disable HTML element interactions
      UIManager.prototype.switchToUiVariant = jest.fn();
    });
    describe('when a PlaylistTransition event is part of PlayerEvent', () => {
      beforeEach(() => {
        (playerMock.exports.PlayerEvent as any).SourceError = MobileV3PlayerEvent.SourceError;
        (playerMock.exports.PlayerEvent as any).PlayerError = MobileV3PlayerEvent.PlayerError;
        (playerMock.exports.PlayerEvent as any).PlaylistTransition = MobileV3PlayerEvent.PlaylistTransition;
      });
      it('attaches the listener', () => {
        const onSpy = jest.spyOn(playerMock, 'on');

        new UIManager(playerMock, MockHelper.generateDOMMock() as any);
        expect(onSpy).toHaveBeenCalledWith('playlisttransition', expect.any(Function));
      });
      describe('and a PlaylistTransition event occurs', () => {
        it('dispatches onUpdated', () => {
          const uiManager = new UIManager(playerMock, MockHelper.generateDOMMock() as any);
          const onUpdatedSpy = jest.fn();
          (uiManager.getConfig() as InternalUIConfig).events.onUpdated.subscribe(onUpdatedSpy);

          playerMock.eventEmitter.firePlaylistTransitionEvent();
          expect(onUpdatedSpy).toHaveBeenCalled();
        });
      });
    });
    describe('when no PlaylistTransition event is part of PlayerEvent', () => {
      beforeEach(() => {
        delete (playerMock.exports.PlayerEvent as any).PlaylistTransition;
      });
      it('does not attach a listener', () => {
        const onSpy = jest.spyOn(playerMock, 'on');

        new UIManager(playerMock, MockHelper.generateDOMMock() as any);
        expect(onSpy).not.toHaveBeenCalledWith('playlisttransition', expect.any(Function));
      });
    });
  });
});
