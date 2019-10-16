import vocabularyDe from './languages/de.json';
import vocabularyEn from './languages/en.json';
import { LocalizationConfig } from '../uimanager.js';

export const defaultVocabularies: Vocabularies = {
  'en': vocabularyEn,
  'de': vocabularyDe,
};

const defaultLocalizationConfig: LocalizationConfig = {
  language: 'en',
  browserLanguageDetection: true,
  vocabularies: defaultVocabularies,
};

type Localizer = () => string;
export type LocalizableText = string | Localizer;

interface Vocabulary {
  'settings.video.quality': string;
  'settings.audio.quality': string;
  'settings.audio.track': string;
  'settings.audio.mute': string;
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
  'fullscreen': string;
  'speed': string;
  'playPause': string;
  'live': string;
  'subtitle.example': string;
  'playingOn': string;
  'connectingTo': string;
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
    const vocabularies = this.mergevocabulariesWithdefaultVocabularies(mergedConfig.vocabularies);
    this.initializeLanguage(mergedConfig.language, mergedConfig.browserLanguageDetection, vocabularies);
    this.initializeVocabulary(vocabularies);
  }

  private containsKey(obj: object, key: string) {
    return obj.hasOwnProperty(key);
  }

  private mergevocabulariesWithdefaultVocabularies(vocabularies: Vocabularies = {}) {
    const rawvocabularies: Vocabularies = { ...defaultVocabularies, ...vocabularies };
    return Object.keys(rawvocabularies).reduce((acc, key) => {
      let translation: CustomVocabulary<Record<string, string>> = rawvocabularies[key as string];
      if (this.containsKey(defaultVocabularies, key) && this.containsKey(vocabularies, key)) {
        translation = { ...defaultVocabularies[key], ...vocabularies[key] };
      }
      return { ...acc, [key]: translation };
    }, {});
  }

  private initializeLanguage(
    language: string,
    browserLanguageDetectionEnabled: boolean,
    vocabularies: Vocabularies,
  ) {
    if (browserLanguageDetectionEnabled) {
      const userLanguage = window.navigator.language;

      if (vocabularies.hasOwnProperty(userLanguage)) {
        this.language = userLanguage;
        return;
      }
      const shortenedUserLanguage = userLanguage.slice(0, 2);
      if (vocabularies.hasOwnProperty(shortenedUserLanguage)) {
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
    const matches = Array.from(text.match(new RegExp('{[a-zA-Z0-9]+}')));
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
      let vocabulariestring = this.vocabulary[key as string];

      if (vocabulariestring == null) {
        vocabulariestring = key as string;
      }

      if (config != null) {
        vocabulariestring = this.replaceVariableWithPlaceholderIfExists(vocabulariestring, config);
      }

      return vocabulariestring;
    };
  }

  public performLocalization(text: LocalizableText) {
    return typeof text === 'function' ? text() : text;
  }
}

export const i18n = new I18n(defaultLocalizationConfig);
