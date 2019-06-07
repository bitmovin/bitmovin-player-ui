import de from './de.json';
import en from './en.json';

export interface LanguageObject {
  [key: string]: string;
}

const languages: { [key: string]: LanguageObject } = {
  de: flattenLanguage(de),
  en: flattenLanguage(en),
};

function flattenLanguage(values: object) {
  return flatten(values);
}

function flatten(object: any, prefix: string = '') {
  const attributes: { [key: string]: any; } = {};

  // Flatten the event object into a string-to-string dictionary with the object property hierarchy in dot notation
  const objectWalker = (object: any, prefix: string) => {
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        const value = object[key];
        if (typeof value === 'object') {
          objectWalker(value, prefix + key + '.');
        } else {
          attributes[prefix + key] = String(value);
        }
      }
    }
  };

  objectWalker(object, prefix);

  return attributes;
}

export { languages };