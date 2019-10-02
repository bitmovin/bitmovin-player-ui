
//#region Interface and Type definitions
export interface BitmovinPlayerUiVocabulary {
  [key: string]: string;
}

export interface BitmovinPlayerUiLocalizationConfig {
  language: string;
  fallbackLanguages?: string[]; // in the order they are given.
  translations: {
    [key: string]: BitmovinPlayerUiVocabulary;
  },
}

interface BitmovinPlayerUiTranslationConfig {
  values?: {
    [key: string]: any;
  },
  language?: string;
}
//#endregion

//#region Default Values
const defaultLocalizationConfig: BitmovinPlayerUiLocalizationConfig = {
  language: 'en',
  translations: {
    'en': {}, // English translation is as same as the keys we provide.
  },
};

//#endregion




class I18n {
  private language: string;
  private lexicon: Map<string, BitmovinPlayerUiVocabulary>;
  
  private fallbackLanguages?: string[];


  constructor(config: BitmovinPlayerUiLocalizationConfig) {
    this.setConfig(config);
  }



  public setConfig(config: BitmovinPlayerUiLocalizationConfig) {
    const { language, translations, fallbackLanguages} = config;
    this.language = language;
    this.lexicon = new Map(Object.keys(translations).map(k => [k, translations[k]]));
    this.fallbackLanguages = fallbackLanguages;

  }

  public setLanguage(language: string) {
    this.language = language;
  }

  private extractVariablesFromTranslationString(translation: string, values: {[key: string]: any} = {}) {
    const translationVariables = Array.from(translation.match(/{([A-Z]|[a-z])+}/g) || []); // looks for {anyValue}

    return translationVariables
      .map(match => [match, match.slice(1, -1)]) 
      .map(([match, key]) => ({ match, value: values[key]}));
  }

  public t(key: string, config: BitmovinPlayerUiTranslationConfig = {}): string {
    const { values, language} = config;

    const translationString = this.lexicon.get(language != null ? language : this.language)[key];

    if (translationString == null) {
      if (this.fallbackLanguages.length >= 1) {
        /**
         * @todo try fallback languages and return the one you find
         */
      }
      return key; // return the key by default which is language: EN
    }

    const translationVariables = this.extractVariablesFromTranslationString(translationString, values);
    return translationVariables.reduce((acc: string, { match, value}) => acc.replace(match, value), translationString);
  }

}

const i18n = new I18n(defaultLocalizationConfig);
export default i18n;
