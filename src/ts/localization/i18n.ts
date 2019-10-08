import vocabularyDe from './de.json';
import vocabularyEn from './en.json';



interface BimovinUIVocabulary {
  'settings': string;
  'settings.fullscreen': string;
  'settings.video.quality': string;
  'settings.audio.quality': string;
  'settings.audio.track': string;
  'settings.speed': string;
  'settings.playPause': string;
  'settings.open': string;
  'settings.audio.mute': string;
  'settings.subtitles': string;
  
  'labels.pictureInPicture': string;
  'labels.appleAirplay': string;
  'labels.googleCast': string;
  'labels.vr': string;
  'labels.off': string;
  'settings.subtitles.fontSize': string;
  'settings.subtitles.fontFamily': string;
  'settings.subtitles.fontColor': string;
  'settings.subtitles.fontOpacity': string;
  'settings.subtitles.characterEdge': string;
  'settings.subtitles.background.color': string;
  'settings.subtitles.background.opacity': string;
  'settings.window.color': string;
  'settings.window.opacity': string;
  'labels.back': string;
  'labels.reset': string;
  'labels.replay': string;
  'messages.ads.remainingTime': string;
}


const englishVocabulary: BimovinUIVocabulary = {
  'settings': 'Settings',
  'settings.fullscreen': 'Fullscreen',
  'settings.video.quality': 'Video Quality',
  'settings.audio.quality': 'Audio Quality',
  'settings.audio.track': 'Audio Track',
  'settings.speed': 'Speed',
  'settings.playPause': 'Play/Pause',
  'settings.open': 'open',
  'settings.audio.mute': 'Volume/Mute',
  'settings.subtitles': 'Subtitles',
  'labels.pictureInPicture': 'Picture-in-Picture',
  'labels.appleAirplay': 'Apple AirPlay',
  'labels.googleCast': 'Google Cast',
  'labels.vr': 'VR',
  'labels.off': 'off',
  'settings.subtitles.fontSize': 'Font size',
  'settings.subtitles.fontFamily': 'Font family',
  'settings.subtitles.fontColor': 'Font color',
  'settings.subtitles.fontOpacity': 'Font opacity',
  'settings.subtitles.characterEdge': 'Character edge',
  'settings.subtitles.background.color': 'Background color',
  'settings.subtitles.background.opacity': 'Background opacity',
  'settings.window.color': 'Window color',
  'settings.window.opacity': 'Window opacity',
  'labels.back': 'Back',
  'labels.reset': 'Reset',
  'labels.replay': 'Replay',
  'messages.ads.remainingTime': 'This ad will end in {remainingTime} seconds.'
}

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
  values?: { [key: string]: any };
  language?: string;
}
//#endregion

//#region Default Values
const defaultTranslations = { 'en': vocabularyEn}; // English translation is as same as the keys we provide.
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
    const translationString = this.vocabulary[key] || key;

    const translationVariables = this.extractVariablesFromTranslationString(translationString, values);
    return translationVariables.reduce((acc: string, { match, value}) => acc.replace(match, value), translationString);
  }

}

const i18n = new I18n(defaultLocalizationConfig);
export default i18n;
