import I18nApi, {  LocalizationConfig } from './i18nApi';
import vocabularyDe from './de.json';
import vocabularyEn from './en.json';

const defaultBitmovinPlayerUiTranslations = {
  'en': vocabularyEn,
  'de': vocabularyDe,
};

const defaultLocalizationConfig: LocalizationConfig = {
  language: 'de',
  fallbackLanguages: ['en'],
  disableBrowserLanguageDetection: true,
  translations: defaultBitmovinPlayerUiTranslations,
};


const i18n = new I18nApi(defaultLocalizationConfig);

export {
  i18n,
  defaultBitmovinPlayerUiTranslations,
  defaultLocalizationConfig,
};