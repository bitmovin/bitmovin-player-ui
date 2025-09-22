// @ts-check

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default tseslint.config({
  files: ['src/**/*.ts', 'spec/**/*.ts'],
  extends: [
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
      languageOptions: {
        parserOptions: {
          project: 'eslint-tsconfig.json',
          tsconfigRootDir: __dirname,
        },
      },
    },
    prettier, // needs to be last in the extends array
  ],
  rules: {
    'no-prototype-builtins': 'off',
    'prefer-const': 'off', // TODO: enable rule and run autofix
    'prefer-rest-params': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-empty-object-type': 'off',
    '@typescript-eslint/no-wrapper-object-types': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    '@typescript-eslint/no-unsafe-enum-comparison': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-redundant-type-constituents': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-unused-expressions': [
      'error',
      {
        allowTernary: true,
      },
    ],
  },
});
