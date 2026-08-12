import * as ts from 'typescript';
import * as path from 'path';
import { i18n, defaultVocabularies } from '../../src/ts/localization/i18n';

const fallbackTest = 'fallback test';
const successEn = 'success';
const successDe = 'erfolg';
const successIt = 'successo';
const successPt = 'sucesso';

const defaultConfig = {
  language: 'en',
  vocabularies: {
    it: {
      test: successIt,
      [fallbackTest]: successIt,
    },
    en: {
      test: successEn,
      [fallbackTest]: successEn,
      variableTest: `{value}`,
    },
    de: {
      test: successDe,
    },
    pt: {
      test: successPt,
    },
  },
};

function getVocabularyInterfaceKeys(): string[] {
  const filePath = path.resolve(__dirname, '../../src/ts/localization/i18n.ts');
  const program = ts.createProgram([filePath], { resolveJsonModule: true });
  const sourceFile = program.getSourceFile(filePath);
  const checker = program.getTypeChecker();

  if (!sourceFile) {
    throw new Error(`Could not load source file: ${filePath}`);
  }

  let keys: string[] = [];
  ts.forEachChild(sourceFile, node => {
    if (ts.isInterfaceDeclaration(node) && node.name.text === 'Vocabulary') {
      const type = checker.getTypeAtLocation(node);
      keys = type.getProperties().map(prop => prop.name);
    }
  });
  return keys.sort();
}

describe('Localization', () => {
  beforeEach(() => {
    i18n.setConfig(defaultConfig);
  });

  describe('Locale initialiization', () => {
    it("uses vocabulary 'en'", () => {
      expect(i18n.performLocalization(i18n.getLocalizer('test'))).toEqual(successEn);
    });

    it("uses vocabulary 'de'", () => {
      i18n.setConfig({ ...defaultConfig, language: 'de' });
      expect(i18n.performLocalization(i18n.getLocalizer('test'))).toEqual(successDe);
    });

    it("uses vocabulary 'it'", () => {
      i18n.setConfig({ ...defaultConfig, language: 'it' });
      expect(i18n.performLocalization(i18n.getLocalizer('test'))).toEqual(successIt);
    });
  });

  describe("Language Fallback's", () => {
    it('falls back to `key` if it is not in vocabulary', () => {
      expect(i18n.performLocalization(i18n.getLocalizer('some word'))).toEqual('some word');
    });

    it('falls back to', () => {
      i18n.setConfig({ ...defaultConfig, language: 'de' });
      expect(i18n.performLocalization(i18n.getLocalizer(fallbackTest))).toEqual(successEn);
    });
  });

  describe('Variable Injection', () => {
    it('injects the value to string passed by config', () => {
      expect(i18n.performLocalization(i18n.getLocalizer('variableTest', { value: 1 }))).toEqual('1');
    });

    Object.entries(defaultVocabularies).forEach(([language, vocabulary]) => {
      it(`includes the visible live label in the ${language} live action label`, () => {
        i18n.setConfig({ language, vocabularies: defaultVocabularies });
        const liveLabel = i18n.performLocalization(i18n.getLocalizer('live'));
        const liveActionLabel = i18n.performLocalization(i18n.getLocalizer('live.jumpToLiveEdge', { liveLabel }));

        expect(liveActionLabel).toContain(liveLabel);
      });
    });
  });

  describe('setLanguage', () => {
    it('changes language when a valid language is provided', () => {
      i18n.setLanguage('de');
      expect(i18n.performLocalization(i18n.getLocalizer('test'))).toEqual(successDe);
    });

    it('falls back to a two-character language code when available', () => {
      i18n.setLanguage('it-CH');
      expect(i18n.performLocalization(i18n.getLocalizer('test'))).toEqual(successIt);
    });

    it('falls back to a two-character portuguese language code when available', () => {
      i18n.setLanguage('pt-BR');
      expect(i18n.performLocalization(i18n.getLocalizer('test'))).toEqual(successPt);
    });

    it('falls back to the configured default language when no match is found', () => {
      i18n.setConfig({ ...defaultConfig, language: 'de' });
      i18n.setLanguage('it');
      expect(i18n.performLocalization(i18n.getLocalizer('test'))).toEqual(successIt);

      i18n.setLanguage('unsupported-language');
      expect(i18n.performLocalization(i18n.getLocalizer('test'))).toEqual(successDe);
    });

    it('dispatches a language change event only when the language actually changes', () => {
      // In the test the default config is used, which always has the `events` set, so we can force unwrap it
      const dispatchSpy = jest.spyOn(i18n.getConfig().events!.onLanguageChanged, 'dispatch');

      i18n.setLanguage('de');
      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(i18n, { newLanguage: 'de', oldLanguage: 'en' });

      i18n.setLanguage('de');
      expect(dispatchSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Vocabulary completeness', () => {
    const enKeys = Object.keys(defaultVocabularies['en']).sort();
    const interfaceKeys = getVocabularyInterfaceKeys();

    it('Vocabulary interface should have every key from en.json', () => {
      const missingFromInterface = enKeys.filter(key => !interfaceKeys.includes(key));
      expect(missingFromInterface).toEqual([]);
    });

    it('en.json should have every key from Vocabulary interface', () => {
      const missingFromJson = interfaceKeys.filter(key => !enKeys.includes(key));
      expect(missingFromJson).toEqual([]);
    });

    Object.entries(defaultVocabularies)
      .filter(([lang]) => lang !== 'en')
      .forEach(([lang, vocab]) => {
        it(`${lang}.json should have every key that en.json has`, () => {
          const langKeys = Object.keys(vocab);
          const missingKeys = enKeys.filter(key => !langKeys.includes(key));
          expect(missingKeys).toEqual([]);
        });
      });
  });
});
