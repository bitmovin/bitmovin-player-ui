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
    it('should use vocabulary \'en\'', () => {
      expect(i18n.t('test')).toEqual(successEn);
    });

    it('should use vocabulary \'de\'', () => {
      i18n.setConfig({...defaultConfig, language: 'de'});
      expect(i18n.t('test')).toEqual(successDe);
    });

    it('should use vocabulary \'it\'', () => {
      i18n.setConfig({...defaultConfig, language: 'it'});
      expect(i18n.t('test')).toEqual(successIt);
    });
  });

  describe('Fallback\'s', () => {

    it('should fall back to `key` if it is not in vocabulary', () => {
      expect(i18n.t('some word')).toEqual('some word');
    });

    it('should fall back to english unless defined otherwise', () => {
      i18n.setConfig({...defaultConfig, language: 'de'});
      expect(i18n.t(fallbackTest)).toEqual(successEn);
    });

    it('should fall back to italian since we prioritize `it` fallback over `en`', () => {
      i18n.setConfig({...defaultConfig, language: 'de', fallbackLanguages: ['it', 'en']});
      expect(i18n.t(fallbackTest)).toEqual(successIt);
    });

  });
});