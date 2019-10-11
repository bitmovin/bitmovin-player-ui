import { defaultTranslations, LocalizableText } from './i18n';

interface Vocab {
  'settings': string;
  'settings.video.quality': string;
  'settings.audio.quality': string;
  'settings.audio.track': string;
  'settings.audio.mute': string;
  'settings.window.color': string;
  'settings.window.opacity': string;
  'settings.subtitles': string;
  'settings.subtitles.font.color': string;
  'settings.subtitles.font.opacity': string;
  'settings.subtitles.background.color': string;
  'settings.subtitles.background.opacity': string;
  'settings.fullscreen': string;
  'settings.speed': string;
  'settings.playPause': string;
  'settings.open': string;
  'labels.pictureInPicture': string;
  'labels.appleAirplay': string;
  'labels.googleCast': string;
  'labels.vr': string;
  'labels.off': string;
  'labels.auto': string;
  'labels.back': string;
  'labels.reset': string;
  'labels.replay': string;
  'labels.normal': string;
  'labels.default': string;
  'colors.white': string;
  'colors.black': string;
  'colors.red': string;
  'colors.green': string;
  'colors.blue': string;
  'colors.cyan': string;
  'colors.yellow': string;
  'colors.magenta': string;
  'opacity.100': string;
  'opacity.75': string;
  'opacity.50': string;
  'opacity.25': string;
  'opacity.0': string;
  'settings.subtitles.font.size': string;
  'settings.subtitles.font.size.50': string;
  'settings.subtitles.font.size.75': string;
  'settings.subtitles.font.size.100': string;
  'settings.subtitles.font.size.150': string;
  'settings.subtitles.font.size.200': string;
  'settings.subtitles.font.size.300': string;
  'settings.subtitles.font.size.400': string;
  'settings.subtitles.characterEdge': string;
  'settings.subtitles.characterEdge.raised': string;
  'settings.subtitles.characterEdge.depressed': string;
  'settings.subtitles.characterEdge.uniform': string;
  'settings.subtitles.characterEdge.dropshadowed': string;
  'settings.subtitles.font.family': string;
  'settings.subtitles.font.family.monospacedserif': string;
  'settings.subtitles.font.family.proportionalserif': string;
  'settings.subtitles.font.family.monospacedsansserif': string;
  'settings.subtitles.font.family.proportionalsansserif': string;
  'settings.subtitles.font.family.casual': string;
  'settings.subtitles.font.family.cursive': string;
  'settings.subtitles.font.family.smallcapital': string;
  'messages.ads.remainingTime': string;
}

export type CustomVocabulary<V> = V & Partial<Vocab>;
type StringKeyMap = {[key: string]: string};

export interface BitmovinPlayerUiTranslations {
  [key: string]: CustomVocabulary<StringKeyMap>;
}

export interface LocalizationConfig {
  language: 'en' | 'de' | string;
  fallbackLanguages?: string[];
  disableBrowserLanguageDetection?: boolean;
  translations: BitmovinPlayerUiTranslations;
}

export default class I18nApi {
  private language: string;
  private vocabulary: CustomVocabulary<StringKeyMap>;

  constructor(config: LocalizationConfig) {
    this.setConfig(config);
  }

  public setConfig(config: LocalizationConfig) {
    const translations = this.mergeTranslationsWithDefaultTranslations(config.translations);
    this.initializeLanguage(config.language, config.disableBrowserLanguageDetection, translations);
    const fallbackLanguages = this. getConfiguredFallbackLanguages(translations, config.fallbackLanguages);
    this.initializeVocabulary(translations, fallbackLanguages);
  }

  private containsKey(obj: object, key: string) {
    return Object.keys(obj).indexOf(key) !== -1;
  }

  private mergeTranslationsWithDefaultTranslations(translations: BitmovinPlayerUiTranslations) {
    const rawTranslations: BitmovinPlayerUiTranslations = { ...defaultTranslations, ...translations};
    return Object.keys(rawTranslations).reduce((acc, key) => {
      let translation: CustomVocabulary<StringKeyMap> = rawTranslations[key as string];
      if (this.containsKey(defaultTranslations, key) && this.containsKey(translations, key)) {
        translation = {...defaultTranslations[key], ...translations[key]};
      }
      return { ...acc, [key]: translation };
    }, {} as BitmovinPlayerUiTranslations);
  }

  private initializeLanguage(
    language: string,
    disableBrowserLanguageDetection: boolean,
    translations: BitmovinPlayerUiTranslations,
  ) {
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

  private getConfiguredFallbackLanguages(translations: BitmovinPlayerUiTranslations, fallbackLanguages?: string[]) {
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

  public t<V extends CustomVocabulary<StringKeyMap> = CustomVocabulary<StringKeyMap>>(key: keyof V) {
    return () => {
      if (key == null) { // because sometimes we call toDomElement() without configuring the component or setting text...
        return undefined;
      }
      let translationString = this.vocabulary[key as string | number];

      if (translationString == null) {
        console.warn(`We haven't been able to find a translation provided for key: '${key}'... The value of the key will be set to '${key}'.\n Please provide correct value via 'config' if this was not intended.`);
        translationString = key as string;
      }
      return translationString;
    };
  }


  public getLocalizedText(text: LocalizableText) {
    return typeof text === 'function' ? text() : text;
  }

}