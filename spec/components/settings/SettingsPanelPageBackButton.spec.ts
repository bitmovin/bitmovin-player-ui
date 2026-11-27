import { SettingsPanel } from '../../../src/ts/components/settings/SettingsPanel';
import { SettingsPanelPageBackButton } from '../../../src/ts/components/settings/SettingsPanelPageBackButton';
import { SettingsPanelPageOpenButton } from '../../../src/ts/components/settings/SettingsPanelPageOpenButton';
import { SettingsPanelPage } from '../../../src/ts/components/settings/SettingsPanelPage';
import { defaultVocabularies, i18n } from '../../../src/ts/localization/i18n';

describe('SettingsPanelPageBackButton', () => {
  // Components keep listening for UI language changes until they are released
  const components: { release(): void }[] = [];
  const track = <T extends { release(): void }>(component: T): T => {
    components.push(component);
    return component;
  };

  afterEach(() => {
    components.splice(0).forEach(component => component.release());
    i18n.setConfig({ language: 'en', vocabularies: defaultVocabularies });
  });

  it.each`
    config                                                        | expectedText       | expectedName
    ${{}}                                                         | ${'Back'}          | ${'Back'}
    ${{ text: 'Video Quality' }}                                  | ${'Video Quality'} | ${'Video Quality, back'}
    ${{ text: i18n.getLocalizer('settings.audio.track') }}        | ${'Audio Track'}   | ${'Audio Track, back'}
    ${{ text: 'Video Quality', ariaLabel: 'Leave quality page' }} | ${'Video Quality'} | ${'Leave quality page'}
  `(
    'should show "$expectedText" and be named "$expectedName" for config $config',
    ({ config, expectedText, expectedName }) => {
      const backButton = track(new SettingsPanelPageBackButton({ container: new SettingsPanel({}), ...config }));
      const element = backButton.getDomElement().get(0);

      expect(element.textContent).toBe(expectedText);
      expect(element.getAttribute('aria-label')).toBe(expectedName);
    },
  );

  it('should localize the back hint of a titled back button', () => {
    i18n.setConfig({ language: 'de', vocabularies: defaultVocabularies });

    const backButton = track(
      new SettingsPanelPageBackButton({
        container: new SettingsPanel({}),
        text: i18n.getLocalizer('settings.audio.track'),
      }),
    );

    expect(backButton.getDomElement().get(0).getAttribute('aria-label')).toMatch(/, zurück$/);
  });

  it('should update the visible title and the accessible name together when the UI language changes', () => {
    const backButton = track(
      new SettingsPanelPageBackButton({
        container: new SettingsPanel({}),
        text: i18n.getLocalizer('settings.audio.track'),
        // A real prefix, so that the visible text can be found again
        cssPrefix: 'ui',
      }),
    );
    const element = backButton.getDomElement().get(0);

    i18n.setLanguage('de');

    expect(element.textContent).toBe('Audiospur');
    expect(element.getAttribute('aria-label')).toBe('Audiospur, zurück');
  });

  it('should keep an accessible name set at runtime when the UI language changes', () => {
    const backButton = track(
      new SettingsPanelPageBackButton({
        container: new SettingsPanel({}),
        text: i18n.getLocalizer('settings.audio.track'),
        // A real prefix, so that the visible text can be found again
        cssPrefix: 'ui',
      }),
    );
    backButton.setAriaLabel('Leave audio page');

    i18n.setLanguage('de');

    expect(backButton.getDomElement().get(0).getAttribute('aria-label')).toBe('Leave audio page');
  });

  it('should name a page open button after its visible text in the new UI language', () => {
    // The subtitle settings open button of the default UI has no own accessible name and uses its text
    const openButton = track(
      new SettingsPanelPageOpenButton({
        container: new SettingsPanel({}),
        targetPage: new SettingsPanelPage({}),
        text: i18n.getLocalizer('settings.subtitles.options'),
        cssPrefix: 'ui',
      }),
    );
    const element = openButton.getDomElement().get(0);
    expect(element.getAttribute('aria-label')).toBe('Options');

    i18n.setLanguage('de');

    expect(element.textContent).toBe('Optionen');
    expect(element.getAttribute('aria-label')).toBe('Optionen');
  });
});
