import * as vocabularyDe from './languages/de.json';
import * as vocabularyEn from './languages/en.json';
import * as vocabularyEs from './languages/es.json';
import * as vocabularyFr from './languages/fr.json';
import * as vocabularyNl from './languages/nl.json';

import { LocalizationConfig } from '../UIManager';
import { EventDispatcher } from '../EventDispatcher';

export const defaultVocabularies: Vocabularies = {
  de: vocabularyDe,
  en: vocabularyEn,
  es: vocabularyEs,
  fr: vocabularyFr,
  nl: vocabularyNl,
};

export interface LanguageChangedArgument {
  newLanguage: string;
  oldLanguage: string;
}

const defaultLocalizationConfig: LocalizationConfig = {
  language: 'en',
  vocabularies: defaultVocabularies,
  events: {
    onLanguageChanged: new EventDispatcher<I18n, LanguageChangedArgument>(),
  },
};

/**
 * @category Localization
 */
export type Localizer = () => string;
/**
 * @category Localization
 */
export type LocalizableText = string | Localizer;

/**
 * @category Localization
 */
export interface Vocabulary {
  'settings.video.quality': string;
  'settings.audio.quality': string;
  'settings.audio.track': string;
  'settings.audio.mute': string;
  'settings.audio.volume': string;
  'settings.subtitles': string;
  'settings.subtitles.options': string;
  'settings.subtitles.font.color': string;
  'settings.subtitles.font.opacity': string;
  'settings.subtitles.background.color': string;
  'settings.subtitles.background.opacity': string;
  'settings.subtitles.font.size': string;
  'settings.subtitles.font.style': string;
  'settings.subtitles.font.style.bold': string;
  'settings.subtitles.font.style.italic': string;
  'settings.subtitles.characterEdge': string;
  'settings.subtitles.characterEdge.raised': string;
  'settings.subtitles.characterEdge.depressed': string;
  'settings.subtitles.characterEdge.uniform': string;
  'settings.subtitles.characterEdge.dropshadowed': string;
  'settings.subtitles.characterEdge.color': string;
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
  play: string;
  pause: string;
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
  percent: string;
  settings: string;
  'ads.remainingTime': string;
  'ads.skip': string;
  'ads.skippableIn': string;
  'ads.adNumberOfTotal': string;
  pictureInPicture: string;
  appleAirplay: string;
  googleCast: string;
  vr: string;
  off: string;
  auto: string;
  back: string;
  reset: string;
  replay: string;
  normal: string;
  default: string;
  open: string;
  close: string;
  fullscreen: string;
  speed: string;
  playPause: string;
  live: string;
  'subtitle.example': string;
  'subtitle.select': string;
  playingOn: string;
  connectingTo: string;
  watermarkLink: string;
  controlBar: string;
  player: string;
  seekBar: string;
  'seekBar.value': string;
  'seekBar.timeshift': string;
  'seekBar.durationText': string;
  'quickseek.forward': string;
  'quickseek.rewind': string;
  ecoMode: string;
  'ecoMode.title': string;
}

/**
 * @category Localization
 */
export type CustomVocabulary<V> = V & Partial<Vocabulary>;

/**
 * @category Localization
 */
export interface Vocabularies {
  [key: string]: CustomVocabulary<Record<string, string>>;
}

/**
 * @category Localization
 */
export class I18n {
  private language: string;
  private defaultLanguage: string;
  private vocabulary: CustomVocabulary<Record<string, string>>;
  private vocabularies: Vocabularies;
  private config: LocalizationConfig;

  constructor(config: LocalizationConfig) {
    this.setConfig(config);
  }

  public setConfig(config: LocalizationConfig) {
    this.config = { ...defaultLocalizationConfig, ...config };
    const detectBrowserLanguage = this.config.language === 'auto';
    this.vocabularies = this.mergeVocabulariesWithDefaultVocabularies(this.config.vocabularies);
    this.initializeLanguage(this.config.language, detectBrowserLanguage, this.vocabularies);
    this.defaultLanguage = this.resolveDefaultLanguage(this.language);
    if (!I18n.containsLanguage(this.vocabularies, this.language)) {
      this.language = this.defaultLanguage;
    }
    this.initializeVocabulary(this.vocabularies);
  }

  public getConfig(): LocalizationConfig {
    return this.config;
  }

  public setLanguage(language: string): void {
    const oldLanguage = this.language;

    if (I18n.containsLanguage(this.vocabularies, language)) {
      this.language = language;
    } else if (I18n.containsLanguage(this.vocabularies, language.slice(0, 2))) {
      this.language = language.slice(0, 2);
    } else {
      this.language = this.defaultLanguage;
    }

    this.initializeVocabulary(this.vocabularies);

    if (this.language !== oldLanguage) {
      this.config.events.onLanguageChanged.dispatch(this, { newLanguage: this.language, oldLanguage: oldLanguage });
    }
  }

  private static containsLanguage(vocabularies: Vocabularies, language: string) {
    return vocabularies.hasOwnProperty(language);
  }

  private resolveDefaultLanguage(language: string): string {
    if (I18n.containsLanguage(this.vocabularies, language)) {
      return language;
    }

    if (I18n.containsLanguage(this.vocabularies, 'en')) {
      return 'en';
    }

    const availableLanguages = Object.keys(this.vocabularies);
    return availableLanguages.length > 0 ? availableLanguages[0] : 'en';
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

  private initializeLanguage(language: string, browserLanguageDetectionEnabled: boolean, vocabularies: Vocabularies) {
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
    this.vocabulary = ['en', this.language].reduce((vocab, lang) => ({ ...vocab, ...(vocabularies[lang] || {}) }), {});
  }

  private replaceVariableWithPlaceholderIfExists(text: string, config: any) {
    const matches = text.match(new RegExp('{[a-zA-Z0-9]+}', 'g'));
    if (matches.length === 0) {
      return text;
    }

    return (
      matches
        .map((m: string) => ({ match: m, key: m.slice(1, -1) }))
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        .reduce((str, { key, match }) => (config.hasOwnProperty(key) ? str.replace(match, config[key]) : str), text)
    );
  }

  public getLocalizer<V extends CustomVocabulary<Record<string, string>> = CustomVocabulary<Record<string, string>>>(
    key: keyof V,
    config?: Record<string, string | number>,
  ): Localizer {
    return () => {
      if (key == null) {
        // because sometimes we call toDomElement() without configuring the component or setting text...
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

/**
 * @category Localization
 */
export const i18n = new I18n(defaultLocalizationConfig);
