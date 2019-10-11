import I18nApi, { LocalizationConfig, BitmovinPlayerUiTranslations } from './i18nApi';
import vocabularyDe from './languages/de.json';
import vocabularyEn from './languages/en.json';


type LocalizableCallback = () => string;
type LocalizableText = string | LocalizableCallback;

const defaultTranslations: BitmovinPlayerUiTranslations = {
  'en': vocabularyEn,
  'de': vocabularyDe,
};

const defaultLocalizationConfig: LocalizationConfig = {
  language: 'en',
  fallbackLanguages: ['en'],
  disableBrowserLanguageDetection: true,
  translations: defaultTranslations,
};


const i18n = new I18nApi(defaultLocalizationConfig);

export {
  i18n,
  defaultTranslations,
  defaultLocalizationConfig,
  LocalizableText,
};