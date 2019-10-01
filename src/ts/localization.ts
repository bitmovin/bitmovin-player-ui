import { LocalizationSettings } from './uiconfig';
import { UIConfig } from 'bitmovin-player';

export interface BitmovinPlayerUiVocabulary {
  'meta.title': string;
  'meta.description': string;
  'settings.videoQuality': string;
  'settings.audioQuality': string;
  'settings.audioTrack': string;
  'settings.speed': string;
  'settings.open': string;
  'settings.subtitles': string;
  'settings.subtitles.characterEdge': string;
  'settings.subtitles.font.size': string;
  'settings.subtitles.font.family': string;
  'settings.subtitles.font.color': string;
  'settings.subtitles.font.opacity': string;
  'settings.subtitles.off': string;
  'settings.subtitles.background.color': string;
  'settings.subtitles.background.opacity': string;
  'settings.window.color': string;
  'settings.window.opacity': string;
  'settings.back': string;
  'settings.reset': string;
  'message.status.connecting': string; // (name) => `Connecting to {name} `
  'message.ads.timeRemaining': string; // (time) => `Ad: {time} remaining`
}




const vocabulary_en: BitmovinPlayerUiVocabulary = {
  'meta.title': '',
  'meta.description': '',
  'settings.videoQuality': 'Video Quality',
  'settings.audioQuality': 'Audio Quality',
  'settings.audioTrack': 'Audio Track',
  'settings.speed': 'Speed',
  'settings.open': 'open',
  'settings.subtitles': 'Subtites',
  'settings.subtitles.characterEdge': '',
  'settings.subtitles.font.size': '',
  'settings.subtitles.font.family': '',
  'settings.subtitles.font.color': '',
  'settings.subtitles.off': 'english',
  'settings.subtitles.font.opacity': '',
  'settings.subtitles.background.color': '',
  'settings.subtitles.background.opacity': '',
  'settings.window.color': '',
  'settings.window.opacity': '',
  'settings.back': '',
  'settings.reset': '',
  'message.status.connecting': `Connecting to {name}`,
  'message.ads.timeRemaining': `Ad: {time} remaining`,
};

export const defaultLocalizationSettings: LocalizationSettings = {
  language: 'en',
  languages: ['en'],
  translations: {
    'en': vocabulary_en,
  },
};

const VariablePatternRegex = /{([A-Z]|[a-z])+}/g;
const getVariablesFrom = (str: string): any[] => Array.from(str.match(VariablePatternRegex) || []);

export function i18n(settings: LocalizationSettings | null, selector: keyof BitmovinPlayerUiVocabulary, config?: any): string {

  const { language, translations } = settings != null ? settings : defaultLocalizationSettings;
  const vocabulary: BitmovinPlayerUiVocabulary = translations[language];
  const rawTranslation: string = vocabulary[selector];

  if (rawTranslation ==  null) {
    throw new Error('You are trying to translate a word that doesn\'t exist in vocabulary');
  }

  // TODO: Check if config exists...
  const translationVariables = getVariablesFrom(rawTranslation).map((match) => {
    const key = match.slice(1, -1);
    const value = config[key];
    return {match, key, value};
  });

  const translation = translationVariables.reduce((acc: string, {match, value}) => acc.replace(match, value), rawTranslation);

  return translation;
};

export type LocalizerType = (selector: keyof BitmovinPlayerUiVocabulary, config?: any) =>  string;
export const createLocalizer = (config: UIConfig): LocalizerType => {
  const { localization} = config;
  const localizationSettings = localization != null ? localization : defaultLocalizationSettings;
  return (selector: keyof BitmovinPlayerUiVocabulary, config?: any) => i18n(localizationSettings, selector, config);
};




