import { en, de } from './translations';
import { Translation } from './translations/translation-types';


// TODO: This import style should be removed after build tool upgrade
// This hack gives us minimal build size
import _merge = require('lodash/merge');
import _cloneDeep = require('lodash/cloneDeep');


// This gives saves us build size but will not work with functions
// Better solution is requiered
// let _cloneDeep = function(o: any): any {
//   return JSON.parse(JSON.stringify(o))
// };



/**
  This module will provide other modules with localized UI strings
  via a singleton pattern.

  Singleton is a root of all evil, but in this case we provide it as a sane
  default. There is an escape hatch (`I18n` class) provided.

  Assumptions:
    - We will use english as a default language.
    - User can supply another language via UI-config and we will respect that
    - It is possible to translate UI internally,
      and provide locale via a simple config string

  Future work:
    - It is possible to make use of getters / setters:
      - will lead to better IDE support
      - would be possible to utilize typescript built-in
        interface and enum support. This will also reduce
        a bundle size
*/

const predifinedLanguages: any = {
  en: en,
  de: de,
};

/**
 * @prop q - quick translation
 * @prop en - default english map of strings
 */
export class BtTranslate {

  public q: Translation  = _cloneDeep(en);
  public en: Translation = _cloneDeep(en);

  constructor() {
    return this;
  }

  public g(): Translation {
    return this.q;
  }

  public addTranslation(newTranslation: any): void {
    this.q = _merge({}, this.q, newTranslation);
  }

  public setLocale(locale: string): void {
    if (predifinedLanguages[locale] !== undefined ) {
      const selected = predifinedLanguages[locale];
      this.q = _cloneDeep(selected);
    }
    else {
      console.warn(`The locale ${locale} is not supported`);
    }
  }
}

const singleton = new BtTranslate();

export {
  singleton as default,
  BtTranslate as I18n,
  en as en,
};

/**
  Remove after MAR 1 2018

  --- Label based lookup prototype: i18next analogue

  * Quick translate
  * @param label Nested label

  // public t(label: string): string {
  //   let localized: string = '';
  //   localized = _get(this.userTranslation, label) || _get(en, label, '');

  //   if (localized === '') {
  //     console.warn(`Translation for '${label}' not found. Using label itself as a translation`);
  //     localized = label;
  //   }


  //   return localized;
  // }

*/
