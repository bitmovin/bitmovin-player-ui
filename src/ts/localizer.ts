import { LocalizationSettings } from './uiconfig';

//#region Type Definitions
export interface BitmovinPlayerUiVocabulary {
  [key: string]: string;
}
//#endregion

//#region Default Values
var vocabularyDe = {
  // Settings menu
  'Video Quality': 'Videoqualität',
  'Audio Quality': 'Audioqualität',
  'Audio Track': 'Audiospur',
  'Speed': 'Geschwindigkeit',
  'Play/Pause': 'Abspielen/Pause',

  'open': 'öffnen',
  'Volume/Mute': 'Lautstärke/Stummschaltunge',
  'Picture-in-Picture': 'Bild im Bild',
  'Apple AirPlay': 'Apple AirPlay',
  'Google Cast': 'Google Cast',
  'VR': 'VR',
  'Settings': 'Einstellungen',
  'Fullscreen': 'Vollbild',
  'off': 'aus',


  // Subtitle settings menu
  'Subtitles': 'Untertitel',
  'Font size': 'Größe',
  'Font family': 'Schriftart',
  'Font color': 'Farbe',
  'Font opacity': 'Deckkraft',
  'Character edge': 'Ränder',
  'Background color': 'Hintergrundfarbe (Text)',
  'Background opacity': 'Hintergrunddeckkraft (Text)',
  'Window color': 'Hintergrundfarbe (Textbox)',
  'Window opacity': 'Hintergrunddeckkraft (Textbox)',
  'Back': 'Zurück',
  'Reset': 'Zurücksetzen',
  'Replay': 'Wiederholen',
};

export const defaultLocalizationSettings: LocalizationSettings = {
  language: 'en',
  languages: ['en', 'de'],
  translations: {
    'en': {},
    'de': vocabularyDe,
  },
};
//#endregion

const VariablePatternRegex = /{([A-Z]|[a-z])+}/g;
const getVariablesFromTranslation = (str: string): any[] => Array.from(str.match(VariablePatternRegex) || []);
const extractVariablesFromTranslationString = (translation: string, config: any) => getVariablesFromTranslation(translation)
  .map((match) => [match, match.slice(1, -1)] )
  .map(([match, key]) => ({ match, value: config[key]}));

const createLocalizer = () => {
  let language: string;
  let languages: string[];
  let lexicon: Map<string, BitmovinPlayerUiVocabulary>;

  const getVocabulary = () => lexicon.get(language);

  return {
    setLanguage: (newLanguage: string) => {
      language = newLanguage;
    },
    setConfig: (config: LocalizationSettings) => {
      language = config.language;
      languages = config.languages;
      lexicon = new Map(Object.keys(config.translations).map(k => [k, config.translations[k]])); //Object.entries;
    },
    get: (key: string, config: any = {}) => {
      const rawTranslation: string = getVocabulary()[key];

      if (rawTranslation == null)  {
        console.log(key);
        return key; // the default translation is in english
      }

      const translationVariables = extractVariablesFromTranslationString(rawTranslation, config);
      return translationVariables.reduce((acc: string, {match, value}) => acc.replace(match, value), rawTranslation);
    },
    render: () => {
      return <div />
    }
  };
};


const localizer = createLocalizer();
localizer.setConfig(defaultLocalizationSettings);

export default localizer;



localizer.get(`Ads: finish in {time}`, { time: 10 })
let time = {
  'Ads: finish in {time}': 'Ads: wird in {time} mins',
  'asdasd asdasd': 'german asd'
}


label = new Label('asdasd asdasd')














