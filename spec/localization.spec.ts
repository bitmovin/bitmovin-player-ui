import { i18n } from '../src/ts/localization/i18n';

const fallbackTest = 'fallback test';
const successEn = 'success';
const successDe = 'erfolg';
const successIt = 'successo';

const defaultConfig = {
  language: 'en',
  disableBrowserLanguageDetection: true,
  translations: {
    'it': {
      'test': successIt,
      [fallbackTest]: successIt,
    },
    'en': {
      'test': successEn,
      [fallbackTest]: successEn,
    },
    'de': {
      'test': successDe,
    },
  },
};

describe('Localization', () => {
  beforeEach(() => {
    i18n.setConfig(defaultConfig);
  });

  describe('Locale initialiization', () => {
    it('uses vocabulary \'en\'', () => {
      expect(i18n.getLocalizedText(i18n.t('test'))).toEqual(successEn);
    });

    it('uses vocabulary \'de\'', () => {
      i18n.setConfig({ ...defaultConfig, language: 'de' });
      expect(i18n.getLocalizedText(i18n.t('test'))).toEqual(successDe);
    });

    it('uses vocabulary \'it\'', () => {
      i18n.setConfig({ ...defaultConfig, language: 'it' });
      expect(i18n.getLocalizedText(i18n.t('test'))).toEqual(successIt);
    });
  });

  describe('Language Fallback\'s', () => {
    it('falls back to `key` if it is not in vocabulary', () => {
      expect(i18n.getLocalizedText(i18n.t('some word'))).toEqual('some word');
    });

    it('falls back to english unless defined otherwise', () => {
      i18n.setConfig({ ...defaultConfig, language: 'de' });
      expect(i18n.getLocalizedText(i18n.t(fallbackTest))).toEqual(successEn);
    });

    it('falls back to italian since we prioritize `it` fallback over `en`', () => {
      i18n.setConfig({ ...defaultConfig, language: 'de', fallbackLanguages: ['it', 'en'] });
      expect(i18n.getLocalizedText(i18n.t(fallbackTest))).toEqual(successIt);
    });
  });
});
