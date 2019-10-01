import { LocalizationSettings } from './uiconfig';
import { UIConfig } from 'bitmovin-player';

//#region Type Definitions
export type LocalizerType = (selector: keyof BitmovinPlayerUiVocabulary, config?: any) =>  string;

export interface BitmovinPlayerUiVocabulary {
  'meta.title': string;
  'meta.description': string;
  'settings.videoQuality': string;
  'settings.audioQuality': string;
  'settings.audioTrack': string;
  'settings.speed': string;
  'settings.open': string;
  'settings.back': string;
  'settings.default': string;
  'settings.subtitles': string;
  'settings.subtitles.font.size': string;
  'settings.subtitles.font.family': string;
  'settings.subtitles.font.color': string;
  'settings.subtitles.font.opacity': string;
  'settings.subtitles.characterEdge': string;
  'settings.subtitles.off': string;
  'settings.subtitles.background.color': string;
  'settings.subtitles.background.opacity': string;
  'settings.subtitles.window.color': string;
  'settings.subtitles.window.opacity': string;
  'settings.reset': string;
  'message.status.connecting': string; // (name) => `Connecting to {name} `
  'message.ads.timeRemaining': string; // (time) => `Ad: {time} remaining`
}

//#endregion

//#region Default Values

const vocabularyEn: BitmovinPlayerUiVocabulary = {
  'meta.title': '',
  'meta.description': '',
  'settings.videoQuality': 'Video Quality eng',
  'settings.audioQuality': 'Audio Quality',
  'settings.audioTrack': 'Audio Track',
  'settings.speed': 'Speed',
  'settings.open': 'open',
  'settings.back': 'Back',
  'settings.default': 'default',
  'settings.subtitles': 'Subtites',
  'settings.subtitles.font.size': 'Font size',
  'settings.subtitles.font.family': 'Font family',
  'settings.subtitles.font.color': 'Font color',
  'settings.subtitles.font.opacity': 'Font opacity',
  'settings.subtitles.characterEdge': 'Character edge',
  'settings.subtitles.off': 'off',
  'settings.subtitles.background.color': 'Background color',
  'settings.subtitles.background.opacity': 'Background opacity',
  'settings.subtitles.window.color': 'Window color',
  'settings.subtitles.window.opacity': 'Window opacity',
  'settings.reset': '',
  'message.status.connecting': `Connecting to {name}`,
  'message.ads.timeRemaining': `Ad: {time} remaining`,
};

export const defaultLocalizationSettings: LocalizationSettings = {
  language: 'en',
  languages: ['en'],
  translations: {
    'en': vocabularyEn,
  },
};
//#endregion

//#region Helper Functions
const VariablePatternRegex = /{([A-Z]|[a-z])+}/g;
const getVariablesFromTranslation = (str: string): any[] => Array.from(str.match(VariablePatternRegex) || []);
const extractVariablesFromTranslationString = (translation: string, config: any) => getVariablesFromTranslation(translation)
  .map((match) => [match, match.slice(1, -1)] )
  .map(([match, key]) => ({ match, value: config[key]}));
//#endregion

export function i18n(settings: LocalizationSettings | null, selector: keyof BitmovinPlayerUiVocabulary, config: any = {}): string {

  const { language, translations } = settings != null ? settings : defaultLocalizationSettings;
  const vocabulary: BitmovinPlayerUiVocabulary = {...vocabularyEn, ...translations[language] }; // spread to ensure we have default values if translation is not defined
  const rawTranslation: string = vocabulary[selector];

  if (rawTranslation ==  null) {
    throw new Error('You are trying to translate a word that doesn\'t exist in vocabulary');
  }
  const translationVariables = extractVariablesFromTranslationString(rawTranslation, config);
  const translation = translationVariables.reduce((acc: string, {match, value}) => acc.replace(match, value), rawTranslation);

  return translation;
}

export const createLocalizer = (config: UIConfig): LocalizerType => {
  const { localization} = config;
  const localizationSettings = localization != null ? localization : defaultLocalizationSettings;
  return (selector: keyof BitmovinPlayerUiVocabulary, config?: any) => i18n(localizationSettings, selector, config);
};

