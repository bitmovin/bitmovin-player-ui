import vocabularyDe from './de.json';
import vocabularyEn from './en.json';
//#region Interface and Type definitions
export interface BitmovinPlayerUiVocabulary {
  [key: string]: string;
}

interface TranslanslationsType {
  [key: string]: BitmovinPlayerUiVocabulary;
}

export interface BitmovinPlayerUiLocalizationConfig {
  language: string;
  fallbackLanguages?: string[]; // in the order they are given.
  disableBrowserLanguageDetection?: boolean; // will disable 
  translations: TranslanslationsType;
}

interface BitmovinPlayerUiTranslationConfig {
  values?: {
    [key: string]: any;
  },
  language?: string;
}
//#endregion

//#region Default Values
const defaultTranslations = { 'en': vocabularyEn}; // English translation is as same as the keys we provide.
const defaultLocalizationConfig: BitmovinPlayerUiLocalizationConfig = {
  language: 'en',
  fallbackLanguages: ['en'],
  translations: defaultTranslations,
  //translations: {
  //  ...defaultTranslations,
  //  de: vocabularyDe
  //}
};
//#endregion




class I18n {
  private language: string;
  private vocabulary: BitmovinPlayerUiVocabulary;


  constructor(config: BitmovinPlayerUiLocalizationConfig) {
    this.setConfig(config);
  }


  public setConfig(config: BitmovinPlayerUiLocalizationConfig) {
    const { language  } = config;

    if (config.disableBrowserLanguageDetection != null && config.disableBrowserLanguageDetection) {
      this.language = language;
    } else {
      let userLanguage = (window.navigator.language);
      userLanguage = userLanguage.slice(0, 2);
      this.language = userLanguage;
    }

    const translations = { ...defaultTranslations, ...config.translations};
    const fallbackLanguages = this.initializeFallbackLanguages(translations, config.fallbackLanguages);

    this.initializeVocabulary(translations, fallbackLanguages);
  }

  private initializeFallbackLanguages(translations: TranslanslationsType, fallbackLanguages?: string[]) {
    /**
     * we extend fallback languages with user-defined translation keys.
     * 'en' added statically to ensure it will be prioritized over the values of translation keys.
     * new Set([]) will remove the duplicate and help us to add default fallbacks while respecting the order of user-defined fallbackLanguages
     * removed 'translation' because it can't be fallback to itself.
     */
    return Array
      .from(new Set([...(fallbackLanguages || []), 'en', ...Object.keys(translations)]))
      .filter(l => l !== this.language);
  }

  private initializeVocabulary(translations: TranslanslationsType, fallbackLanguages: string[]) {
    // reverse() to ensure we prioritize user-defined fallbackLanguages right after current language.
    this.vocabulary = [...fallbackLanguages.reverse(), this.language] 
      .reduce((vocab: BitmovinPlayerUiVocabulary, lang: string) => ({
        ...vocab,
        ...(translations[lang] || {}),
    }), {});
  }

  private extractVariablesFromTranslationString(translation: string, values: {[key: string]: any} = {}) {
    const translationVariables = Array.from(translation.match(/{([A-Z]|[a-z])+}/g) || []); // looks for {anyValue}

    return translationVariables
      .map(match => [match, match.slice(1, -1)])  // extract key for next step
      .map(([match, key]) => ({ match, value: values[key]}));
  }


  public t(key: string, config: BitmovinPlayerUiTranslationConfig = {}): string {
    if (key == null) { // because sometimes we try to get DomElement without configuring the component...
      return undefined;
    }

    const { values} = config;
    const translationString = this.vocabulary[key] || key;

    const translationVariables = this.extractVariablesFromTranslationString(translationString, values);
    return translationVariables.reduce((acc: string, { match, value}) => acc.replace(match, value), translationString);
  }

}

const i18n = new I18n(defaultLocalizationConfig);
export default i18n;
