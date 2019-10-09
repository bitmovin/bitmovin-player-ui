import vocabularyDe from './de.json';
import vocabularyEn from './en.json';

//#region Interface and Type definitions
interface BitmovinPlayerUiStaticVocabulary {
  'settings': string;
  // Video & Audio
  'settings.video.quality': string;
  'settings.audio.quality': string;
  'settings.audio.track': string;
  'settings.audio.mute': string;
  // Window
  'settings.window.color': string;
  'settings.window.opacity': string;
  // Subtitles
  'settings.subtitles': string;
  'settings.subtitles.fontSize': string;
  'settings.subtitles.fontFamily': string;
  'settings.subtitles.fontColor': string;
  'settings.subtitles.fontOpacity': string;
  'settings.subtitles.characterEdge': string;
  'settings.subtitles.background.color': string;
  'settings.subtitles.background.opacity': string;
  // Other Settings
  'settings.fullscreen': string;
  'settings.speed': string;
  'settings.playPause': string;
  'settings.open': string;
  // Labels
  'labels.pictureInPicture': string;
  'labels.appleAirplay': string;
  'labels.googleCast': string;
  'labels.vr': string;
  'labels.off': string;
  'labels.back': string;
  'labels.reset': string;
  'labels.replay': string;
  // Messages
  'messages.ads.remainingTime': string;
}

interface BitmovinPlayerUiVocabulary extends Partial<BitmovinPlayerUiStaticVocabulary> {
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
  values?: { [key: string]: any };
  language?: string;
}
//#endregion

//#region Default Values
const defaultTranslations = {
  'en': vocabularyEn,
  'de': vocabularyDe,
};

const defaultLocalizationConfig: BitmovinPlayerUiLocalizationConfig = {
  language: 'en',
  fallbackLanguages: ['de'],
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
    const translations = { ...defaultTranslations, ...config.translations};
    this.initializeLanguage(config.language, config.disableBrowserLanguageDetection, translations);
    const fallbackLanguages = this.initializeFallbackLanguages(translations, config.fallbackLanguages);
    this.initializeVocabulary(translations, fallbackLanguages);
  }

  private initializeLanguage(language: string, disableBrowserLanguageDetection: boolean, translations: TranslanslationsType ) {
    const shouldDetectLanguage = !(disableBrowserLanguageDetection != null && disableBrowserLanguageDetection);

    if (shouldDetectLanguage) {
      let userLanguage = (window.navigator.language);
      userLanguage = userLanguage.slice(0, 2);
      // Check if  we also have it the language in the translations...
      if (Object.keys(translations).findIndex((k) => k === userLanguage) !== -1) {
        this.language = userLanguage;
        return;
      }
    }

    this.language = language;
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
    if (key == null) { // because sometimes we call toDomElement() without configuring the component...
      return undefined;
    }

    const { values} = config;
    let translationString = this.vocabulary[key];
    if (translationString == null) {
      console.warn(`We haven't been able to find a translation provided for key: '${key}'... The value of the key will be set to '${key}'.\n Please provide correct value via 'config' if this was not intended.`);
      translationString = key;
    }

    const translationVariables = this.extractVariablesFromTranslationString(translationString, values);
    return translationVariables.reduce((acc: string, { match, value}) => acc.replace(match, value), translationString);
  }

}

const i18n = new I18n(defaultLocalizationConfig);
export default i18n;
