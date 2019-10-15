import { i18n } from '../src/ts/localization/i18n';

const fallbackTest = 'fallback test';
const successEn = 'success';
const successDe = 'erfolg';
const successIt = 'successo';

const defaultConfig = {
  language: 'en',
  browserLanguageDetection: false,
  translations: {
    'it': {
      'test': successIt,
      [fallbackTest]: successIt,
    },
    'en': {
      'test': successEn,
      [fallbackTest]: successEn,
      'variableTest': `{value}`,
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
      expect(i18n.localize(i18n.getLocalizableCallback('test'))).toEqual(successEn);
    });

    it('uses vocabulary \'de\'', () => {
      i18n.setConfig({ ...defaultConfig, language: 'de' });
      expect(i18n.localize(i18n.getLocalizableCallback('test'))).toEqual(successDe);
    });

    it('uses vocabulary \'it\'', () => {
      i18n.setConfig({ ...defaultConfig, language: 'it' });
      expect(i18n.localize(i18n.getLocalizableCallback('test'))).toEqual(successIt);
    });
  });

  describe('Language Fallback\'s', () => {
    it('falls back to `key` if it is not in vocabulary', () => {
      expect(i18n.localize(i18n.getLocalizableCallback('some word'))).toEqual('some word');
    });

    it('falls back to', () => {
      i18n.setConfig({ ...defaultConfig, language: 'de' });
      expect(i18n.localize(i18n.getLocalizableCallback(fallbackTest))).toEqual(successEn);
    });
  });

  describe('Variable Injection', () => {
    it ('injects the value to string passed by config', () => {
      expect(i18n.localize(i18n.getLocalizableCallback('variableTest', { value: 1 }))).toEqual('1');
    });
  });
});
