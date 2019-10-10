import { defaultBitmovinPlayerUiTranslations } from "./i18n";

interface StaticVocabulary {
  'settings': string;
  'settings.video.quality': string;
  'settings.audio.quality': string;
  'settings.audio.track': string;
  'settings.audio.mute' : string;
  // Window
  'settings.window.color' : string;
  'settings.window.opacity' : string;
  // Subtitles
  'settings.subtitles' : string;
  'settings.subtitles.font.color' : string;
  'settings.subtitles.font.opacity' : string;
  'settings.subtitles.background.color' : string;
  'settings.subtitles.background.opacity': string;
  // Other Settings
  'settings.fullscreen' : string;
  'settings.speed': string;
  'settings.playPause' : string;
  'settings.open': string;
  // Labels
  'labels.pictureInPicture': string;
  'labels.appleAirplay' : string;
  'labels.googleCast': string;
  'labels.vr' : string;
  'labels.off': string;
  'labels.auto': string;
  'labels.back' : string;
  'labels.reset': string;
  'labels.replay': string;
  'labels.normal': string;
  'labels.default': string;
  // Colors
  'colors.white': string;
  'colors.black': string;
  'colors.red': string;
  'colors.green': string;
  'colors.blue': string;
  'colors.cyan': string;
  'colors.yellow': string;
  'colors.magenta': string;
  // opacity
  'opacity.100': string;
  'opacity.75': string;
  'opacity.50': string;
  'opacity.25': string;
  'opacity.0': string;
  // fontSize
  'settings.subtitles.font.size': string;
  'settings.subtitles.font.size.50': string;
  'settings.subtitles.font.size.75': string;
  'settings.subtitles.font.size.100': string;
  'settings.subtitles.font.size.150': string;
  'settings.subtitles.font.size.200': string;
  'settings.subtitles.font.size.300': string;
  'settings.subtitles.font.size.400': string;
  // character Edge
  'settings.subtitles.characterEdge': string;
  'settings.subtitles.characterEdge.raised': string;
  'settings.subtitles.characterEdge.depressed': string;
  'settings.subtitles.characterEdge.uniform': string;
  'settings.subtitles.characterEdge.dropshadowed': string;
  // font Family
  'settings.subtitles.font.family': string;
  'settings.subtitles.font.family.monospacedserif': string;
  'settings.subtitles.font.family.proportionalserif': string;
  'settings.subtitles.font.family.monospacedsansserif': string;
  'settings.subtitles.font.family.proportionalsansserif': string;
  'settings.subtitles.font.family.casual': string;
  'settings.subtitles.font.family.cursive': string;
  'settings.subtitles.font.family.smallcapital': string;
  // Messages
  'messages.ads.remainingTime': string;
}

export type Vocabulary<V> =  V & Partial<StaticVocabulary>;
type StringKeyMap = {[key: string]: string};

interface BitmovinPlayerUiTranslations {
  [key: string]: Vocabulary<StringKeyMap>;
}

export interface LocalizationConfig {
  language: string;
  fallbackLanguages?: string[];
  disableBrowserLanguageDetection?: boolean;
  translations: BitmovinPlayerUiTranslations;
}


export default class I18nApi {
  private language: string;
  private vocabulary: Vocabulary<StringKeyMap>;

  constructor(config: LocalizationConfig) {
    this.setConfig(config);
  }

  public setConfig(config: LocalizationConfig) {
    console.group('initializing');
    console.log(config);
    const translations = { ...defaultBitmovinPlayerUiTranslations, ...config.translations};
    this.initializeLanguage(config.language, config.disableBrowserLanguageDetection, translations);
    const fallbackLanguages = this.initializeFallbackLanguages(translations, config.fallbackLanguages);
    this.initializeVocabulary(translations, fallbackLanguages);
    console.log(this.vocabulary)
    console.log(this.language)
    console.groupEnd();
  }

  private initializeLanguage(language: string, disableBrowserLanguageDetection: boolean, translations: BitmovinPlayerUiTranslations) {
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

  private initializeFallbackLanguages(translations: BitmovinPlayerUiTranslations, fallbackLanguages?: string[]) {
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

  private initializeVocabulary(translations: BitmovinPlayerUiTranslations, fallbackLanguages: string[]) {
    // reverse() to ensure we prioritize user-defined fallbackLanguages right after current language.
    this.vocabulary = [...fallbackLanguages.reverse(), this.language]
      .reduce((vocab, lang) => ({...vocab, ...(translations[lang] || {})}), {});
  }

  public t<V extends Vocabulary<StringKeyMap> = Vocabulary<StringKeyMap>>(key: keyof V) {
    if (key == null) { // because sometimes we call toDomElement() without configuring the component...
      return undefined;
    }
    let translationString = this.vocabulary[key as string | number];
    if (key === 'labels.default') {
      // console.log(key);
      // console.log(this.language);
      // console.log(this.vocabulary);

    }

    if (translationString == null) {
      console.warn(`We haven't been able to find a translation provided for key: '${key}'... The value of the key will be set to '${key}'.\n Please provide correct value via 'config' if this was not intended.`);
      translationString = key as string;
    }
    return translationString;
  }

}
