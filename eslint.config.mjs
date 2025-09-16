import { defineConfig } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig([
  {
    ignores: [
      'build/**/*',
      'coverage/**/*',
      'dist/**/*',
      'docs/**/*',
      'node_modules/**/*',
      'release/**/*',
      'testing/**/*',
      '**/*.d.ts',
    ],
  },
  {
    files: ['**/*.ts'],
    plugins: {
      js,
      'simple-import-sort': simpleImportSort,
    },
    extends: ['js/recommended'],
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
      reportUnusedInlineConfigs: 'off',
    },
  },
  tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },

      parser: tseslint.parser,
      ecmaVersion: 5,
      sourceType: 'module',

      parserOptions: {
        project: './tsconfig.json',
      },
    },

    rules: {
      // Best Practices
      'no-eval': 'error',
      // TODO: Enable no-console rule and introduce proper logging facility
      // 'no-console': 'error',
      'accessor-pairs': 'off',
      'no-implied-eval': 'error',
      'no-nested-ternary': 'error',
      'no-array-constructor': 'error',
      'array-callback-return': ['error', { allowImplicit: true }],
      'no-unneeded-ternary': ['error', { defaultAssignment: false }],
      // TODO: Enable magic numbers rule and replace magic numbers with named constants
      // '@typescript-eslint/no-magic-numbers': [
      //   'error',
      //   { ignore: [-1, 0, 1], ignoreArrayIndexes: true, ignoreEnums: true, detectObjects: true, enforceConst: true },
      // ],

      // Style
      'simple-import-sort/imports': 'error',
      'no-new-wrappers': 'error',
      'id-match': 'error',
      'no-new-func': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'object-shorthand': [
        'error',
        'always',
        { avoidExplicitReturnArrows: true, ignoreConstructors: true, avoidQuotes: true },
      ],
      '@typescript-eslint/no-useless-constructor': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',

      // Variables
      'no-var': 'error',
      'prefer-const': ['error', { destructuring: 'any', ignoreReadBeforeAssign: false }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '[iI]gnored',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Overrides of `recommended` rules
      'no-prototype-builtins': 'off',
      'no-case-declarations': 'off',
      'prefer-spread': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
  {
    // TypeScript overrides
    files: ['*.ts'],
    rules: {
      'no-undef': 'off',
      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': 'warn',
    },
  },
  {
    // Unit test overrides
    files: ['spec/**/*.ts'],
    rules: {
      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      // Console allowed in tests
      // 'no-console': 'off',
    },
  },
  {
    // Source file overrides
    files: ['src/**/*.ts'],
    languageOptions: {
      globals: globals.browser,
    },
  },
]);
