import { SettingsPanel } from '../../../src/ts/components/settings/SettingsPanel';
import { SettingsPanelPageBackButton } from '../../../src/ts/components/settings/SettingsPanelPageBackButton';
import { defaultVocabularies, i18n } from '../../../src/ts/localization/i18n';

describe('SettingsPanelPageBackButton', () => {
  afterEach(() => {
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
      const backButton = new SettingsPanelPageBackButton({ container: new SettingsPanel({}), ...config });
      const element = backButton.getDomElement().get(0);

      expect(element.textContent).toBe(expectedText);
      expect(element.getAttribute('aria-label')).toBe(expectedName);
    },
  );

  it('should localize the back hint of a titled back button', () => {
    i18n.setConfig({ language: 'de', vocabularies: defaultVocabularies });

    const backButton = new SettingsPanelPageBackButton({
      container: new SettingsPanel({}),
      text: i18n.getLocalizer('settings.audio.track'),
    });

    expect(backButton.getDomElement().get(0).getAttribute('aria-label')).toMatch(/, zurück$/);
  });
});
