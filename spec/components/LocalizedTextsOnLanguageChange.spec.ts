import { i18n } from '../../src/ts/localization/i18n';
import { MockHelper, TestingPlayerAPI } from '../helper/MockHelper';
import { Component, ComponentConfig } from '../../src/ts/components/Component';
import { SeekBar, SeekBarConfig } from '../../src/ts/components/seekbar/SeekBar';
import { VolumeSlider } from '../../src/ts/components/seekbar/VolumeSlider';
import { Label, LabelConfig } from '../../src/ts/components/labels/Label';
import { PlaybackTimeLabel } from '../../src/ts/components/labels/PlaybackTimeLabel';
import { SelectBox } from '../../src/ts/components/settings/SelectBox';
import { ItemSelectionList } from '../../src/ts/components/lists/ItemSelectionList';
import { DynamicSettingsPanelItem } from '../../src/ts/components/settings/DynamicSettingsPanelItem';
import {
  InteractiveContextMenuItem,
  InteractiveContextMenuItemConfig,
} from '../../src/ts/components/contextmenu/InteractiveContextMenuItem';
import { PlayerInsightsContextMenuItem } from '../../src/ts/components/panels/player-insights/PlayerInsightsContextMenuItem';
import type { PlayerInsightsPanel } from '../../src/ts/components/panels/player-insights/PlayerInsightsPanel';
import { VolumeController } from '../../src/ts/utils/VolumeController';
import { Button, ButtonConfig } from '../../src/ts/components/buttons/Button';
import { AdSkipButton } from '../../src/ts/components/ads/AdSkipButton';
import { AdCounterLabel } from '../../src/ts/components/ads/AdCounterLabel';
import type { UIInstanceManager } from '../../src/ts/UIManager';

// MockHelper mocks the DOM, but the subject here is the rendered markup after a language change. A mock factory takes
// precedence over the automock that MockHelper requests.
jest.mock('../../src/ts/DOM', () => jest.requireActual('../../src/ts/DOM'));

describe('localized texts on a UI language change', () => {
  let playerMock: TestingPlayerAPI;
  let uiInstanceManagerMock: UIInstanceManager;
  let components: Component<ComponentConfig>[];

  beforeEach(() => {
    i18n.setConfig({ language: 'en' });
    playerMock = MockHelper.getPlayerMock();
    uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();
    components = [];
  });

  afterEach(() => {
    components.forEach(component => component.release());
    i18n.setConfig({ language: 'en' });
    jest.restoreAllMocks();
  });

  function track<T extends Component<ComponentConfig>>(component: T): T {
    components.push(component);
    return component;
  }

  function element(component: Component<ComponentConfig>): HTMLElement {
    return component.getDomElement().get(0);
  }

  describe('SeekBar', () => {
    function renderVodSeekBar(config: SeekBarConfig = {}): SeekBar {
      jest.spyOn(playerMock, 'isLive').mockReturnValue(false);
      jest.spyOn(playerMock, 'getDuration').mockReturnValue(80);
      jest.spyOn(playerMock, 'getCurrentTime').mockReturnValue(5);
      const seekBar = track(new SeekBar({ smoothPlaybackPositionUpdateIntervalMs: -1, ...config }));
      seekBar.configure(playerMock, uiInstanceManagerMock);
      // Updates the slider values like the seek bar does on a playback position change while the UI is shown
      seekBar['setAriaSliderValues']();

      return seekBar;
    }

    it('should render its accessible name and value text in the new language', () => {
      const seekBar = renderVodSeekBar();
      expect(element(seekBar).getAttribute('aria-label')).toBe('Video timeline');
      expect(element(seekBar).getAttribute('aria-valuetext')).toBe('5 Seconds out of 1 Minutes 20 Seconds');

      i18n.setLanguage('de');

      expect(element(seekBar).getAttribute('aria-label')).toBe('Video-Timeline');
      expect(element(seekBar).getAttribute('aria-valuetext')).toBe('5 Sekunden aus 1 Minuten 20 Sekunden');
    });

    it('should render a name that contains the current time in the new language', () => {
      const seekBar = renderVodSeekBar({ addCurrentTimeToAriaLabel: true });
      expect(element(seekBar).getAttribute('aria-label')).toBe('Video timeline: 5 Seconds');

      i18n.setLanguage('de');

      expect(element(seekBar).getAttribute('aria-label')).toBe('Video-Timeline: 5 Sekunden');
    });

    it('should keep a custom plain string name', () => {
      const seekBar = renderVodSeekBar({ ariaLabel: 'Custom timeline' });

      i18n.setLanguage('de');

      expect(element(seekBar).getAttribute('aria-label')).toBe('Custom timeline');
    });

    it.each([
      ['set through setAriaLabel', (seekBar: SeekBar) => seekBar.setAriaLabel('Runtime custom timeline')],
      [
        'changed on the element',
        (seekBar: SeekBar) => element(seekBar).setAttribute('aria-label', 'Runtime custom timeline'),
      ],
    ])('should not add the current time to a name that was %s', (_, overrideName) => {
      const seekBar = renderVodSeekBar({ addCurrentTimeToAriaLabel: true });
      overrideName(seekBar);

      i18n.setLanguage('de');
      seekBar['setAriaSliderValues']();

      expect(element(seekBar).getAttribute('aria-label')).toBe('Runtime custom timeline');
    });
  });

  describe('VolumeSlider', () => {
    it('should render its accessible name and value text in the new language', () => {
      jest.spyOn(playerMock, 'getVolume').mockReturnValue(40);
      jest.spyOn(playerMock, 'isMuted').mockReturnValue(false);
      const volumeController = new VolumeController(playerMock);
      jest.spyOn(uiInstanceManagerMock, 'getConfig').mockReturnValue({
        ...uiInstanceManagerMock.getConfig(),
        volumeController,
      });
      const volumeSlider = track(new VolumeSlider({ hideOnMobile: false, hideIfVolumeControlProhibited: false }));
      volumeSlider.configure(playerMock, uiInstanceManagerMock);
      expect(element(volumeSlider).getAttribute('aria-label')).toBe('Volume');
      expect(element(volumeSlider).getAttribute('aria-valuetext')).toBe('Value: 40');

      i18n.setLanguage('de');

      expect(element(volumeSlider).getAttribute('aria-label')).toBe('Lautstärke');
      expect(element(volumeSlider).getAttribute('aria-valuetext')).toBe('Wert: 40');
    });
  });

  describe('Label', () => {
    it('should render a localized text that was set at runtime in the new language, not the configured text', () => {
      const label = track(new Label<LabelConfig>({ text: i18n.getLocalizer('playerInsights.show') }));
      label.getDomElement();
      label.setText(i18n.getLocalizer('playerInsights.hide'));

      i18n.setLanguage('de');

      expect(label.getText()).toBe('Player Insights ausblenden');
      expect(element(label).textContent).toBe('Player Insights ausblenden');
    });

    it('should not show a cleared localized text again', () => {
      const label = track(new Label<LabelConfig>({ text: 'Plain text' }));
      label.getDomElement();
      label.setText(i18n.getLocalizer('live'));
      label.clearText();

      i18n.setLanguage('fr');

      expect(element(label).textContent).toBe('');
    });

    it('should keep a plain string text that was set at runtime', () => {
      const label = track(new Label<LabelConfig>({ text: i18n.getLocalizer('live') }));
      label.getDomElement();
      label.setText('12:34');

      i18n.setLanguage('fr');

      expect(element(label).textContent).toBe('12:34');
    });
  });

  describe('PlaybackTimeLabel', () => {
    it('should render the live indicator and its accessible name in the new language', () => {
      jest.spyOn(playerMock, 'isLive').mockReturnValue(true);
      jest.spyOn(playerMock, 'getMaxTimeShift').mockReturnValue(-20);
      const playbackTimeLabel = track(new PlaybackTimeLabel());
      playbackTimeLabel.configure(playerMock, uiInstanceManagerMock);
      expect(element(playbackTimeLabel).getAttribute('aria-label')).toBe('Live, jump to live edge');

      i18n.setLanguage('fr');

      expect(playbackTimeLabel.getText()).toBe('En direct');
      expect(element(playbackTimeLabel).getAttribute('aria-label')).toBe('En direct, aller au direct');
    });
  });

  describe('SelectBox', () => {
    it('should render its accessible name and option labels in the new language and keep the selection', () => {
      const selectBox = track(new SelectBox({ ariaLabel: i18n.getLocalizer('settings.audio.quality') }));
      selectBox.addItem('auto', i18n.getLocalizer('auto'));
      selectBox.addItem('off', i18n.getLocalizer('off'));
      selectBox.addItem('custom', 'Custom item');
      selectBox.selectItem('off');
      const select = element(selectBox) as HTMLSelectElement;

      i18n.setLanguage('nl');

      expect(select.getAttribute('aria-label')).toBe('Audiokwaliteit');
      expect(Array.from(select.options).map(option => option.textContent)).toEqual([
        'automatisch',
        'uit',
        'Custom item',
      ]);
      expect(select.options[select.selectedIndex].value).toBe('off');
    });
  });

  describe('ItemSelectionList', () => {
    it('should render its item labels in the new language and keep the selection', () => {
      const list = track(new ItemSelectionList());
      // The list renders its items only after its element exists
      list.getDomElement();
      list.addItem('auto', i18n.getLocalizer('auto'));
      list.addItem('off', i18n.getLocalizer('off'));
      list.selectItem('off');

      i18n.setLanguage('nl');

      const items = Array.from(element(list).querySelectorAll('li'));
      expect(items.map(item => item.textContent)).toEqual(['automatisch', 'uit']);
      expect(items[1].className).toContain('selected');
    });
  });

  describe('settings panel and context menu items', () => {
    it('should render the accessible name of a context menu item in the new language', () => {
      const item = track(
        new InteractiveContextMenuItem<InteractiveContextMenuItemConfig>({
          label: i18n.getLocalizer('contextMenu.copyTimestampLink'),
          ariaLabel: i18n.getLocalizer('contextMenu.copyTimestampLink'),
        }),
      );
      expect(element(item).getAttribute('aria-label')).toBe('Copy link at current time');

      i18n.setLanguage('de');

      expect(element(item).getAttribute('aria-label')).toBe('Link zur aktuellen Zeit kopieren');
    });

    it('should render the accessible name of a dynamic settings panel item in the new language', () => {
      const item = track(
        new DynamicSettingsPanelItem({
          label: i18n.getLocalizer('settings.subtitles'),
          ariaLabel: i18n.getLocalizer('settings.subtitles'),
          settingComponent: new SelectBox(),
          container: undefined,
        }),
      );
      expect(element(item).getAttribute('aria-label')).toBe('Subtitles');

      i18n.setLanguage('de');

      expect(element(item).getAttribute('aria-label')).toBe('Untertitel');
    });

    it('should name the current action of the player insights item in the new language', () => {
      const playerInsightsPanel = {
        isShown: () => true,
        onShow: MockHelper.getEventDispatcherMock(),
        onHide: MockHelper.getEventDispatcherMock(),
        toggleHidden: jest.fn(),
      } as unknown as PlayerInsightsPanel;
      const item = track(new PlayerInsightsContextMenuItem({ playerInsightsPanel }));
      item.configure(playerMock, uiInstanceManagerMock);
      expect(element(item).getAttribute('aria-label')).toBe('Hide Player Insights');

      i18n.setLanguage('de');

      expect(element(item).getAttribute('aria-label')).toBe('Player Insights ausblenden');
      expect(element(item).textContent).toBe('Player Insights ausblenden');
    });
  });

  describe('components that override the language change hook', () => {
    it.each([
      ['an ad skip button', () => new AdSkipButton()],
      ['an ad counter label', () => new AdCounterLabel()],
      [
        'a custom component that does not call super',
        () =>
          new (class extends Button<ButtonConfig> {
            protected onLanguageChanged(): void {
              // Deliberately does not call super.onLanguageChanged()
            }
          })({}),
      ],
    ])('should render the accessible name of %s in the new language', (_, createComponent) => {
      const component = track(createComponent() as Component<ComponentConfig>);
      component.setAriaLabel(i18n.getLocalizer('play'));
      expect(element(component).getAttribute('aria-label')).toBe('Play');

      i18n.setLanguage('de');

      expect(element(component).getAttribute('aria-label')).toBe('Abspielen');
    });
  });
});
