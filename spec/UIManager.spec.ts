import {
  InternalUIConfig,
  PlayerWrapper,
  UIConditionContext,
  UIInstanceManager,
  UIManager,
  UIVariantIdentifier,
  UIVariant,
} from '../src/ts/UIManager';
import { PlayerAPI } from 'bitmovin-player';
import { MockHelper, TestingPlayerAPI } from './helper/MockHelper';
import { MobileV3PlayerEvent } from '../src/ts/utils/MobileV3PlayerAPI';
import { UIContainer } from '../src/ts/components/UIContainer';
import { Container } from '../src/ts/components/Container';
import { StorageUtils } from '../src/ts/utils/StorageUtils';
import { RecommendationConfig, TimelineMarker } from '../src/ts/UIConfig';
import { FullscreenToggleButton } from '../src/ts/components/buttons/FullscreenToggleButton';

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
  const resumeSourceUrl = 'https://cdn.example/m.mpd';
  const resumeStorageKey = resumeStorageKeyForSourceIdentifier(`dash:${resumeSourceUrl}`);

  describe('PlayerWrapper', () => {
    let playerWrapper: PlayerWrapper;

    describe('without inheritance', () => {
      let superClassInstance: A;

      beforeEach(() => {
        const testInstance = new A() as A & PlayerAPI;
        playerWrapper = new PlayerWrapper(testInstance);
        testInstance.giveValueAValue(); // Change the value of the actual property to simulate async loaded module
        superClassInstance = playerWrapper.getPlayer() as unknown as A;
      });

      it('wraps functions', () => {
        expect(superClassInstance.a).not.toBeUndefined();
      });
    });

    describe('with inheritance', () => {
      let inheritedClassInstance: C;

      beforeEach(() => {
        const testInstance = new C() as C & PlayerAPI;
        playerWrapper = new PlayerWrapper(testInstance);
        testInstance.giveValueAValue(); // Change the value of the actual property to simulate async loaded module
        inheritedClassInstance = playerWrapper.getPlayer() as unknown as C;
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

    it('should resolve lazy UIs with spatial navigation', () => {
      const ui = new UIContainer({ components: [new Container({})] });
      const spatialNavigation = { release: jest.fn() };
      const uiManager = new UIManager(playerMock, [
        {
          ui: () => ({
            ui: ui,
            spatialNavigation: spatialNavigation as any,
          }),
        },
      ]);

      expect(uiManager.activeUi.getUI()).toBe(ui);
      expect(uiManager.activeUi['spatialNavigation']).toBe(spatialNavigation);
    });

    it('passes component config to components created by lazy UI variants', () => {
      let fullscreenToggleButton: FullscreenToggleButton | undefined;

      new UIManager(
        playerMock,
        [
          {
            identifier: UIVariantIdentifier.main,
            ui: () => {
              fullscreenToggleButton = new FullscreenToggleButton();
              return new UIContainer({ components: [fullscreenToggleButton] });
            },
          },
        ],
        {
          componentConfigOverrides: {
            ToggleButton: { offClass: 'global-off' },
            FullscreenToggleButton: { text: 'global fullscreen' },
            main: {
              ToggleButton: { offClass: 'main-off' },
              FullscreenToggleButton: { text: 'main fullscreen' },
            },
          },
        },
      );

      expect(fullscreenToggleButton).toBeDefined();
      expect(fullscreenToggleButton.getConfig()).toMatchObject({
        offClass: 'main-off',
        text: 'main fullscreen',
      });
    });

    it('should resolve lazy UIs only when selected and reuse resolved UIs', () => {
      const adUi = new UIContainer({ components: [new Container({})] });
      const defaultUi = new UIContainer({ components: [new Container({})] });
      const adFactory = jest.fn(() => adUi);
      const defaultFactory = jest.fn(() => defaultUi);
      const uiManager = new UIManager(playerMock, [
        {
          ui: adFactory,
          condition: context => context.isAd,
        },
        {
          ui: defaultFactory,
        },
      ]);

      expect(defaultFactory).toHaveBeenCalledTimes(1);
      expect(adFactory).not.toHaveBeenCalled();

      expect(uiManager.activeUi.getUI()).toBe(defaultUi);
      expect(defaultFactory).toHaveBeenCalledTimes(1);

      uiManager.resolveUiVariant({ isAd: true });

      expect(adFactory).toHaveBeenCalledTimes(1);
      expect(uiManager.activeUi.getUI()).toBe(adUi);

      uiManager.resolveUiVariant({ isAd: true });

      expect(adFactory).toHaveBeenCalledTimes(1);

      uiManager.resolveUiVariant();

      expect(defaultFactory).toHaveBeenCalledTimes(1);
      expect(uiManager.activeUi.getUI()).toBe(defaultUi);
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

  describe('resume from last position', () => {
    const windowLocation = window.location.href;

    beforeEach(() => {
      StorageUtils.setStorageApiDisabled({ disableStorageApi: false });
      window.localStorage.clear();
      window.history.replaceState(null, '', windowLocation);
    });

    it('does not resume unless enabled', () => {
      const playerMock = MockHelper.getPlayerMock();
      (playerMock.getSource as jest.Mock).mockReturnValue({ dash: resumeSourceUrl });
      (playerMock.isLive as jest.Mock).mockReturnValue(false);
      window.localStorage.setItem(resumeStorageKey, '90');

      new UIManager(playerMock, [{ ui: new UIContainer({ components: [new Container({})] }) }]);

      const seekMock = (playerMock as unknown as { seek: jest.Mock }).seek;
      expect(seekMock).not.toHaveBeenCalled();
    });

    it('resumes when enabled', () => {
      const playerMock = MockHelper.getPlayerMock();
      (playerMock.getSource as jest.Mock).mockReturnValue({ dash: resumeSourceUrl });
      (playerMock.isLive as jest.Mock).mockReturnValue(false);
      window.localStorage.setItem(resumeStorageKey, '90');

      new UIManager(playerMock, [{ ui: new UIContainer({ components: [new Container({})] }) }], {
        enableResumeFromLastPosition: true,
      });

      const seekMock = (playerMock as unknown as { seek: jest.Mock }).seek;
      expect(seekMock).toHaveBeenCalledWith(90, 'ui');
    });

    it('lets timestamp deep links take precedence over resume', () => {
      window.history.replaceState(null, '', `${window.location.origin}/watch?t=30s`);
      const playerMock = MockHelper.getPlayerMock();
      (playerMock.getSource as jest.Mock).mockReturnValue({ dash: resumeSourceUrl });
      (playerMock.isLive as jest.Mock).mockReturnValue(false);
      window.localStorage.setItem(resumeStorageKey, '90');

      new UIManager(playerMock, [{ ui: new UIContainer({ components: [new Container({})] }) }], {
        enableResumeFromLastPosition: true,
        enableTimestampDeepLink: true,
      });

      const seekMock = (playerMock as unknown as { seek: jest.Mock }).seek;
      expect(seekMock).toHaveBeenCalledTimes(1);
      expect(seekMock).toHaveBeenCalledWith(30, 'ui');

      playerMock.eventEmitter.fireTimeChangedEvent(45);
      playerMock.eventEmitter.firePauseEvent();
      expect(window.localStorage.getItem(resumeStorageKey)).toBe('45');
    });

    it('uses resume for later source loads after timestamp deep link was handled', () => {
      const nextSourceUrl = 'https://cdn.example/next.mpd';
      const nextStorageKey = resumeStorageKeyForSourceIdentifier(`dash:${nextSourceUrl}`);
      window.history.replaceState(null, '', `${window.location.origin}/watch?t=30s`);
      const playerMock = MockHelper.getPlayerMock();
      (playerMock.getSource as jest.Mock).mockReturnValue({ dash: resumeSourceUrl });
      (playerMock.isLive as jest.Mock).mockReturnValue(false);
      window.localStorage.setItem(resumeStorageKey, '90');
      window.localStorage.setItem(nextStorageKey, '120');

      new UIManager(playerMock, [{ ui: new UIContainer({ components: [new Container({})] }) }], {
        enableResumeFromLastPosition: true,
        enableTimestampDeepLink: true,
      });

      (playerMock.getSource as jest.Mock).mockReturnValue({ dash: nextSourceUrl });
      playerMock.eventEmitter.fireSourceLoadedEvent();

      const seekMock = (playerMock as unknown as { seek: jest.Mock }).seek;
      expect(seekMock).toHaveBeenCalledTimes(2);
      expect(seekMock).toHaveBeenNthCalledWith(1, 30, 'ui');
      expect(seekMock).toHaveBeenNthCalledWith(2, 120, 'ui');
    });

    it('does not fall back to resume when timestamp deep link points to the start', () => {
      window.history.replaceState(null, '', `${window.location.origin}/watch?t=0s`);
      const playerMock = MockHelper.getPlayerMock();
      (playerMock.getSource as jest.Mock).mockReturnValue({ dash: resumeSourceUrl });
      (playerMock.isLive as jest.Mock).mockReturnValue(false);
      window.localStorage.setItem(resumeStorageKey, '90');

      new UIManager(playerMock, [{ ui: new UIContainer({ components: [new Container({})] }) }], {
        enableResumeFromLastPosition: true,
        enableTimestampDeepLink: true,
      });

      const seekMock = (playerMock as unknown as { seek: jest.Mock }).seek;
      expect(seekMock).not.toHaveBeenCalled();
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

    it('clears dynamically added recommendations on source load and restores UI config recommendations', () => {
      const configuredRecommendation = createRecommendation('configured-recommendation');
      const dynamicRecommendation = createRecommendation('dynamic-recommendation');
      const configuredRecommendations = [configuredRecommendation];

      uiManager = new UIManager(playerMock, [{ ui: new UIContainer({ components: [new Container({})] }) }], {
        metadata: { recommendations: configuredRecommendations },
      });

      uiManager.recommendations.add(dynamicRecommendation);
      expect(uiManager.recommendations.list()).toEqual([configuredRecommendation, dynamicRecommendation]);
      expect(configuredRecommendations).toEqual([configuredRecommendation]);

      playerMock.eventEmitter.fireSourceLoadedEvent();

      expect(uiManager.recommendations.list()).toEqual([configuredRecommendation]);
    });

    it('clears dynamically added recommendations on source load and restores source recommendations', () => {
      const configuredRecommendation = createRecommendation('configured-recommendation');
      const sourceRecommendation = createRecommendation('source-recommendation');
      const dynamicRecommendation = createRecommendation('dynamic-recommendation');
      const sourceRecommendations = [sourceRecommendation];
      (playerMock.getSource as jest.Mock).mockReturnValue({ recommendations: sourceRecommendations });

      uiManager = new UIManager(playerMock, [{ ui: new UIContainer({ components: [new Container({})] }) }], {
        metadata: { recommendations: [configuredRecommendation] },
      });

      uiManager.recommendations.add(dynamicRecommendation);
      expect(uiManager.recommendations.list()).toEqual([sourceRecommendation, dynamicRecommendation]);
      expect(sourceRecommendations).toEqual([sourceRecommendation]);

      playerMock.eventEmitter.fireSourceLoadedEvent();

      expect(uiManager.recommendations.list()).toEqual([sourceRecommendation]);
    });

    it('preserves functions in source recommendation resources when rebuilding the config', () => {
      const preprocessHttpRequest = jest.fn();
      const sourceRecommendation: RecommendationConfig = {
        title: 'source-recommendation',
        resource: {
          dash: 'https://example.com/manifest.mpd',
          network: { preprocessHttpRequest },
        } as any,
      };
      (playerMock.getSource as jest.Mock).mockReturnValue({ recommendations: [sourceRecommendation] });

      uiManager = new UIManager(playerMock, [{ ui: new UIContainer({ components: [new Container({})] }) }]);

      playerMock.eventEmitter.fireSourceLoadedEvent();

      const [recommendation] = uiManager.recommendations.list();
      expect(recommendation).toBe(sourceRecommendation);
      expect((recommendation.resource as any).network.preprocessHttpRequest).toBe(preprocessHttpRequest);
    });
  });

  describe('timeline markers', () => {
    const createTimelineMarker = (time: number): TimelineMarker => ({ time });

    let playerMock: TestingPlayerAPI;
    let uiManager: UIManager;

    beforeEach(() => {
      playerMock = MockHelper.getPlayerMock();
      uiManager = new UIManager(playerMock, [{ ui: new UIContainer({ components: [new Container({})] }) }], {
        metadata: { markers: [] },
      });
    });

    it('clears dynamically added markers on source load and restores UI config markers', () => {
      const configuredMarker = createTimelineMarker(1);
      const dynamicMarker = createTimelineMarker(2);
      const configuredMarkers = [configuredMarker];

      uiManager = new UIManager(playerMock, [{ ui: new UIContainer({ components: [new Container({})] }) }], {
        metadata: { markers: configuredMarkers },
      });

      uiManager.addTimelineMarker(dynamicMarker);
      expect(uiManager.getTimelineMarkers()).toEqual([configuredMarker, dynamicMarker]);
      expect(configuredMarkers).toEqual([configuredMarker]);

      playerMock.eventEmitter.fireSourceLoadedEvent();

      expect(uiManager.getTimelineMarkers()).toEqual([configuredMarker]);
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

      expect(uiManager.getTimelineMarkers()).toEqual(uiManager.timelineMarkers.list());
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

function resumeStorageKeyForSourceIdentifier(sourceIdentifier: string): string {
  let hash = 0;
  for (let i = 0; i < sourceIdentifier.length; i++) {
    hash = (hash << 5) - hash + sourceIdentifier.charCodeAt(i);
    hash |= 0;
  }
  return `bitmovin.player.ui.resume.${(hash >>> 0).toString(36)}`;
}
