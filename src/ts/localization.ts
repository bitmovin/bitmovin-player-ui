
export interface BitmovinPlayerUiVocabulary {
  'meta.title': string;
  'meta.description': string;
  'settings.videoQuality': string;
  'settings.audioQuality': string;
  'settings.audioTrack': string;
  'settings.speed': string;
  'settings.subtitles': string;
  'settings.subtitles.characterEdge': string;
  'settings.subtitles.font.size': string;
  'settings.subtitles.font.family': string;
  'settings.subtitles.font.color': string;
  'settings.subtitles.font.opacity': string;
  'settings.subtitles.background.color': string;
  'settings.subtitles.background.opacity': string;
  'settings.window.color': string;
  'settings.window.opacity': string;
  'settings.back': string;
  'settings.reset': string;
  'message.status.connecting': string; // (name) => `Connecting to {name} `
  'message.ads.timeRemaining': string; // (time) => `Ad: {time} remaining`
}

interface LocalizationSettings {
  language: string;
  languages: string[];
  translations: {
    [key: string]: BitmovinPlayerUiVocabulary;
  };
}


const vocabulary_en: BitmovinPlayerUiVocabulary = {
  'meta.title': '',
  'meta.description': '',
  'settings.videoQuality': '',
  'settings.audioQuality': '',
  'settings.audioTrack': '',
  'settings.speed': '',
  'settings.subtitles': '',
  'settings.subtitles.characterEdge': '',
  'settings.subtitles.font.size': '',
  'settings.subtitles.font.family': '',
  'settings.subtitles.font.color': '',
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

const defaultLocalizationSettings: LocalizationSettings = {
  language: 'en',
  languages: ['en'],
  translations: {
    'en': vocabulary_en,
  },
};

const getVariablesFrom = (str: string) => Array.from(str.matchAll('{([A-Z]|[a-z])+}'));

export function i18n(settings: LocalizationSettings, selector: string, config?: any) {
  const { language, translations } = settings;
  const vocabulary = translations[language];

  const rawTranslation = vocabulary[selector];
  if (rawTranslation ==  null) {
    throw new Error('You are trying to translate a word that doesn\'t exist in vocabulary');
  }

  // TODO: Check if config exists...
  const translationVariables = getVariablesFrom(rawTranslation).map((match) => {
    const selector = match[0];
    const key = selector.slice(1, -1);
    const value = config[key];
    return {selector, key, value};
  });

  const translation = translationVariables.reduce((acc: string, {selector, value}) => acc.replace(selector, value), rawTranslation);

  return translation;

}




