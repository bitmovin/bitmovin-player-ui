import { LanguageObject, languages } from './languages';
import { ArrayUtils } from '../arrayutils';

export const enum Language {
  DE = 'de',
  EN = 'en',
}

export interface TranslationCallback {
  (): string;
}

export interface LocalizationReplacements {
  [key: string]: string | number | TranslationCallback;
}

export interface TranslatorFunction {
  (value: string, replacements?: LocalizationReplacements, language?: Language): string;
}

export interface I18nAPI {
  t: TranslatorFunction;
}

export class I18n implements I18nAPI {

  private static currentLanguage: Language = Language.EN;
  private static fallbackLanguages: Language[] = [Language.EN];

  private language: Language;

  // instance usage
  constructor(identifier: Language) {
    this.language = identifier;
  }

  t(key: string, replacements?: LocalizationReplacements, language: Language = this.language): string {
    // TODO: placeholders
    return I18n.t(key, language);
  }

  setLanguage(identifier: Language, fallback: Language[] = [Language.EN]): void {
    this.language = identifier;
    I18n.fallbackLanguages = fallback;
  }

  static registerLanguage(identifier: string, localizations: LanguageObject): void {
    if (languages[identifier]) {
      console.warn('Language already exists ... overriding', languages[identifier]);
    }

    languages[identifier] = localizations;
  }

  static setFallbackLanguages(fallback: Language[]): void {
    I18n.fallbackLanguages = fallback;
  }

  static setLanguage(identifier: Language, fallback: Language[] = [Language.EN]): void {
    I18n.currentLanguage = identifier;
    I18n.fallbackLanguages = fallback;
  }

  static getCurrentLanguage(): Language {
    return I18n.currentLanguage;
  }

  // global static usage (private for now ... we could expose it in the future)
  private static t(
    key: string,
    language: Language = I18n.currentLanguage,
    fallback: Language[] = I18n.fallbackLanguages,
  ): string {
    return I18n.translate(key, language, fallback);
  }

  private static translate(key: string, language: Language, fallback: Language[]): string {
    ArrayUtils.remove([...fallback], language);
    const languagesToLocalize: Language[] = [language, ...fallback];

    const valueForKey = (key: string, language: string) => {
      return languages[language] && languages[language][key];
    };

    for (let language of languagesToLocalize) {
      const value = valueForKey(key, language);
      if (value) {
        return value;
      }
    }

    // No translation found in any fallback
    return key;
  }
}
