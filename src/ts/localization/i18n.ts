import I18nApi, {  LocalizationConfig, BitmovinPlayerUiTranslations } from './i18nApi';
import vocabularyDe from './de.json';
import vocabularyEn from './en.json';


type LocalizableCallback = () => string;
type LocalizableText = string | LocalizableCallback;
const getLocalizedText = (text: LocalizableText) => typeof text === 'function' ? text() : text;

const defaultBitmovinPlayerUiTranslations: BitmovinPlayerUiTranslations = {
  'en': vocabularyEn,
  'de': vocabularyDe,
};

const defaultLocalizationConfig: LocalizationConfig = {
  language: 'en',
  fallbackLanguages: ['en'],
  disableBrowserLanguageDetection: true,
  translations: defaultBitmovinPlayerUiTranslations,
};


const i18n = new I18nApi(defaultLocalizationConfig);

export {
  i18n,
  defaultBitmovinPlayerUiTranslations,
  defaultLocalizationConfig,
  LocalizableText,
  getLocalizedText,
};