import {
  InternalUIConfig,
  PlayerWrapper,
  UIConditionContext,
  UIInstanceManager,
  UIManager,
  UIVariant,
} from '../src/ts/UIManager';
import { PlayerAPI } from 'bitmovin-player';
import { MockHelper, TestingPlayerAPI } from './helper/MockHelper';
import { MobileV3PlayerEvent } from '../src/ts/utils/MobileV3PlayerAPI';
import { UIContainer } from '../src/ts/components/UIContainer';
import { Container } from '../src/ts/components/Container';
import { RecommendationConfig, TimelineMarker } from '../src/ts/UIConfig';

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

  describe('activeUi', () => {
    it('should return the active UI instance manager', () => {
      const playerMock = MockHelper.getPlayerMock();
      const uiVariant = { ui: new UIContainer({ components: [new Container({})] }) };
      const uiManager = new UIManager(playerMock, [uiVariant]);

      expect(uiManager.activeUi).toBeInstanceOf(UIInstanceManager);
    });
  });

  describe('recommendations', () => {
    const createRecommendation = (title: string): RecommendationConfig => ({
      title,
      resource: {
        url: `https://example.com/${title}`,
      },
    });

    let playerMock: TestingPlayerAPI;
    let uiManager: UIManager;

    beforeEach(() => {
      playerMock = MockHelper.getPlayerMock();
      uiManager = new UIManager(playerMock, [{ ui: new UIContainer({ components: [new Container({})] }) }], {
        metadata: { recommendations: [] },
      });
    });

    it('adds recommendations and dispatches config update', () => {
      const recommendation = createRecommendation('recommendation-1');
      const onUpdatedSpy = jest.fn();
      (uiManager.getConfig() as InternalUIConfig).events.onUpdated.subscribe(onUpdatedSpy);

      uiManager.recommendations.add(recommendation);

      expect(uiManager.recommendations.list()).toEqual([recommendation]);
      expect(onUpdatedSpy).toHaveBeenCalledWith(uiManager, null);
    });

    it('removes recommendations by reference and dispatches config update', () => {
      const recommendation = createRecommendation('recommendation-1');
      uiManager.recommendations.add(recommendation);
      const onUpdatedSpy = jest.fn();
      (uiManager.getConfig() as InternalUIConfig).events.onUpdated.subscribe(onUpdatedSpy);

      const removed = uiManager.recommendations.remove(recommendation);

      expect(removed).toBe(true);
      expect(uiManager.recommendations.list()).toEqual([]);
      expect(onUpdatedSpy).toHaveBeenCalledWith(uiManager, null);
    });

    it('does not dispatch config update when the recommendation is not present', () => {
      const recommendation = createRecommendation('recommendation-1');
      const otherRecommendation = createRecommendation('recommendation-2');
      uiManager.recommendations.add(recommendation);
      const onUpdatedSpy = jest.fn();
      (uiManager.getConfig() as InternalUIConfig).events.onUpdated.subscribe(onUpdatedSpy);

      const removed = uiManager.recommendations.remove(otherRecommendation);

      expect(removed).toBe(false);
      expect(uiManager.recommendations.list()).toEqual([recommendation]);
      expect(onUpdatedSpy).not.toHaveBeenCalled();
    });
  });

  describe('timelineMarkers', () => {
    const createTimelineMarker = (time: number): TimelineMarker => ({
      time,
      title: `marker-${time}`,
    });

    let playerMock: TestingPlayerAPI;
    let uiManager: UIManager;

    beforeEach(() => {
      playerMock = MockHelper.getPlayerMock();
      uiManager = new UIManager(playerMock, [{ ui: new UIContainer({ components: [new Container({})] }) }], {
        metadata: { markers: [] },
      });
    });

    it('adds timeline markers and dispatches config update', () => {
      const timelineMarker = createTimelineMarker(10);
      const onUpdatedSpy = jest.fn();
      (uiManager.getConfig() as InternalUIConfig).events.onUpdated.subscribe(onUpdatedSpy);

      uiManager.timelineMarkers.add(timelineMarker);

      expect(uiManager.timelineMarkers.list()).toEqual([timelineMarker]);
      expect(onUpdatedSpy).toHaveBeenCalledWith(uiManager, null);
    });

    it('removes timeline markers by reference and dispatches config update', () => {
      const timelineMarker = createTimelineMarker(10);
      uiManager.timelineMarkers.add(timelineMarker);
      const onUpdatedSpy = jest.fn();
      (uiManager.getConfig() as InternalUIConfig).events.onUpdated.subscribe(onUpdatedSpy);

      const removed = uiManager.timelineMarkers.remove(timelineMarker);

      expect(removed).toBe(true);
      expect(uiManager.timelineMarkers.list()).toEqual([]);
      expect(onUpdatedSpy).toHaveBeenCalledWith(uiManager, null);
    });

    it('does not dispatch config update when the timeline marker is not present', () => {
      const timelineMarker = createTimelineMarker(10);
      const otherTimelineMarker = createTimelineMarker(20);
      uiManager.timelineMarkers.add(timelineMarker);
      const onUpdatedSpy = jest.fn();
      (uiManager.getConfig() as InternalUIConfig).events.onUpdated.subscribe(onUpdatedSpy);

      const removed = uiManager.timelineMarkers.remove(otherTimelineMarker);

      expect(removed).toBe(false);
      expect(uiManager.timelineMarkers.list()).toEqual([timelineMarker]);
      expect(onUpdatedSpy).not.toHaveBeenCalled();
    });

    it('keeps deprecated timeline marker APIs backed by the timelineMarkers namespace', () => {
      const timelineMarker = createTimelineMarker(10);

      uiManager.addTimelineMarker(timelineMarker);

      expect(uiManager.getTimelineMarkers()).toBe(uiManager.timelineMarkers.list());
      expect(uiManager.timelineMarkers.list()).toEqual([timelineMarker]);
      expect(uiManager.removeTimelineMarker(timelineMarker)).toBe(true);
      expect(uiManager.timelineMarkers.list()).toEqual([]);
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
