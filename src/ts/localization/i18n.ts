import vocabularyDe from './languages/de.json';
import vocabularyEn from './languages/en.json';
import { LocalizationConfig } from '../uimanager.js';

export const defaultVocabularies: Vocabularies = {
  'en': vocabularyEn,
  'de': vocabularyDe,
};

const defaultLocalizationConfig: LocalizationConfig = {
  language: 'en',
  vocabularies: defaultVocabularies,
};

type Localizer = () => string;
export type LocalizableText = string | Localizer;

interface Vocabulary {
  'settings.video.quality': string;
  'settings.audio.quality': string;
  'settings.audio.track': string;
  'settings.audio.mute': string;
  'settings.audio.volume': string;
  'settings.subtitles': string;
  'settings.subtitles.font.color': string;
  'settings.subtitles.font.opacity': string;
  'settings.subtitles.background.color': string;
  'settings.subtitles.background.opacity': string;
  'settings.subtitles.font.size': string;
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
  'settings.subtitles.window.color': string;
  'settings.subtitles.window.opacity': string;
  'play': string;
  'settings.time.hours': string;
  'settings.time.minutes': string;
  'settings.time.seconds': string;
  'colors.white': string;
  'colors.black': string;
  'colors.red': string;
  'colors.green': string;
  'colors.blue': string;
  'colors.cyan': string;
  'colors.yellow': string;
  'colors.magenta': string;
  'percent': string;
  'settings': string;
  'ads.remainingTime': string;
  'pictureInPicture': string;
  'appleAirplay': string;
  'googleCast': string;
  'vr': string;
  'off': string;
  'auto': string;
  'back': string;
  'reset': string;
  'replay': string;
  'normal': string;
  'default': string;
  'open': string;
  'close': string;
  'fullscreen': string;
  'speed': string;
  'playPause': string;
  'live': string;
  'subtitle.example': string;
  'subtitle.select': string;
  'playingOn': string;
  'connectingTo': string;
  'watermarkLink': string;
  'controlBar': string;
  'player': string;
  'seekBar': string;
  'seekBar.value': string;
  'seekBar.timeshift': string;
  'seekBar.durationText': string;
}

export type CustomVocabulary<V> = V & Partial<Vocabulary>;

export interface Vocabularies {
  [key: string]: CustomVocabulary<Record<string, string>>;
}

class I18n {
  private language: string;
  private vocabulary: CustomVocabulary<Record<string, string>>;

  constructor(config: LocalizationConfig) {
    this.setConfig(config);
  }

  public setConfig(config: LocalizationConfig) {
    const mergedConfig = { ...defaultLocalizationConfig, ...config };
    const detectBrowserLanguage = mergedConfig.language === 'auto';
    const vocabularies = this.mergeVocabulariesWithDefaultVocabularies(mergedConfig.vocabularies);
    this.initializeLanguage(mergedConfig.language, detectBrowserLanguage, vocabularies);
    this.initializeVocabulary(vocabularies);
  }

  private static containsLanguage(vocabularies: Vocabularies, language: string) {
    return vocabularies.hasOwnProperty(language);
  }

  private mergeVocabulariesWithDefaultVocabularies(vocabularies: Vocabularies = {}) {
    const rawVocabularies: Vocabularies = { ...defaultVocabularies, ...vocabularies };
    return Object.keys(rawVocabularies).reduce((mergedVocabularies, language) => {
      let vocabulary = rawVocabularies[language];
      if (I18n.containsLanguage(defaultVocabularies, language) && I18n.containsLanguage(vocabularies, language)) {
        vocabulary = { ...defaultVocabularies[language], ...vocabularies[language] };
      }
      return { ...mergedVocabularies, [language]: vocabulary };
    }, {});
  }

  private initializeLanguage(
    language: string,
    browserLanguageDetectionEnabled: boolean,
    vocabularies: Vocabularies,
  ) {
    if (browserLanguageDetectionEnabled) {
      const userLanguage = window.navigator.language;

      if (I18n.containsLanguage(vocabularies, userLanguage)) {
        this.language = userLanguage;
        return;
      }
      const shortenedUserLanguage = userLanguage.slice(0, 2);
      if (I18n.containsLanguage(vocabularies, shortenedUserLanguage)) {
        this.language = shortenedUserLanguage;
        return;
      }
    }

    this.language = language;
  }

  private initializeVocabulary(vocabularies: Vocabularies) {
    this.vocabulary = ['en', this.language]
      .reduce((vocab, lang) => ({ ...vocab, ...(vocabularies[lang] || {}) }), {});
  }

  private replaceVariableWithPlaceholderIfExists(text: string, config: any) {
    const matches = text.match(new RegExp('{[a-zA-Z0-9]+}', 'g'));
    if (matches.length === 0) {
      return text;
    }

    return matches
      .map((m: string) => ({ match: m, key: m.slice(1, -1) }))
      .reduce((str, { key, match }) => config.hasOwnProperty(key) ? str.replace(match, config[key]) : str, text);
  }

  public getLocalizer<V extends CustomVocabulary<Record<string, string>> = CustomVocabulary<Record<string, string>>>(
    key: keyof V,
    config?: Record<string, string | number>,
  ): Localizer {
    return () => {
      if (key == null) { // because sometimes we call toDomElement() without configuring the component or setting text...
        return undefined;
      }
      let vocabularyString = this.vocabulary[key as string];

      if (vocabularyString == null) {
        vocabularyString = key as string;
      }

      if (config != null) {
        vocabularyString = this.replaceVariableWithPlaceholderIfExists(vocabularyString, config);
      }

      return vocabularyString;
    };
  }

  public performLocalization(text: LocalizableText) {
    return typeof text === 'function' ? text() : text;
  }
}

export const i18n = new I18n(defaultLocalizationConfig);
