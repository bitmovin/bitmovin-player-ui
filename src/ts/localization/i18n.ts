
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
const defaultTranslations = { 'en': {}}; // English translation is as same as the keys we provide.
const defaultLocalizationConfig: BitmovinPlayerUiLocalizationConfig = {
  language: 'en',
  fallbackLanguages: ['en'],
  translations: defaultTranslations,
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
    this.language = language;
    const translations = { ...defaultTranslations, ...config.translations};
    // we add 'en' as default fallback if doesn't exist
    const fallbackLanguages = Array.from( new Set([...(config.fallbackLanguages || []), 'en'])); 
    this.initializeVocabulary(language, translations, fallbackLanguages || [language]); // language is the default fallback.
  }

  private initializeVocabulary(language: string, translations: TranslanslationsType, fallbackLanguages: string[]) {
    const uniqueFallbacksArray = Array.from(new Set([
      ...fallbackLanguages,
      ...Object.keys(translations),
    ])).filter(l => l !== this.language); // remove the current language to add it as last item

    // reverse() so that we prioritize fallback languages over  the keys received translations translations.
    this.vocabulary = [...uniqueFallbacksArray.reverse(), language] 
      .reduce((vocab: BitmovinPlayerUiVocabulary, lang: string) => ({
        ...vocab,
        ...(translations[lang] || {}),
    }), {});
  }

  private extractVariablesFromTranslationString(translation: string, values: {[key: string]: any} = {}) {
    const translationVariables = Array.from(translation.match(/{([A-Z]|[a-z])+}/g) || []); // looks for {anyValue}

    return translationVariables
      .map(match => [match, match.slice(1, -1)]) 
      .map(([match, key]) => ({ match, value: values[key]}));
  }


  public t(key: string, config: BitmovinPlayerUiTranslationConfig = {}): string {
    const { values} = config;
    const translationString = this.vocabulary[key] || key;

    const translationVariables = this.extractVariablesFromTranslationString(translationString, values);
    return translationVariables.reduce((acc: string, { match, value}) => acc.replace(match, value), translationString);
  }

}

const i18n = new I18n(defaultLocalizationConfig);
export default i18n;
