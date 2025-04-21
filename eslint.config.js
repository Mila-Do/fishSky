import { includeIgnoreFile } from '@eslint/compat';
import eslint from '@eslint/js';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';
import eslintPluginAstro from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import pluginReact from 'eslint-plugin-react';
import reactCompiler from 'eslint-plugin-react-compiler';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';

// File path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, '.gitignore');

const baseConfig = tseslint.config({
  extends: [eslint.configs.recommended, tseslint.configs.strict, tseslint.configs.stylistic],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'off',
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'es5',
        printWidth: 120,
      },
    ],
  },
});

const jsxA11yConfig = tseslint.config({
  files: ['**/*.{js,jsx,ts,tsx}'],
  extends: [jsxA11y.flatConfigs.recommended],
  languageOptions: {
    ...jsxA11y.flatConfigs.recommended.languageOptions,
  },
  rules: {
    ...jsxA11y.flatConfigs.recommended.rules,
  },
});

const reactConfig = tseslint.config({
  files: ['**/*.{js,jsx,ts,tsx}'],
  extends: [pluginReact.configs.flat.recommended],
  languageOptions: {
    ...pluginReact.configs.flat.recommended.languageOptions,
    globals: {
      window: true,
      document: true,
    },
  },
  plugins: {
    'react-hooks': eslintPluginReactHooks,
    'react-compiler': reactCompiler,
  },
  settings: { react: { version: 'detect' } },
  rules: {
    ...eslintPluginReactHooks.configs.recommended.rules,
    'react/react-in-jsx-scope': 'off',
    'react-compiler/react-compiler': 'error',
  },
});

const tsConfig = tseslint.config({
  files: ['**/*.ts', '**/*.tsx', '**/*.mts'],
  ignores: ['**/node_modules/**', 'dist/**', '.vercel/**'],
  rules: {
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
  },
});

const ignoreConfig = tseslint.config({
  ignores: ['src/db/database.types.ts'],
});

export default tseslint.config(
  includeIgnoreFile(gitignorePath),
  baseConfig,
  jsxA11yConfig,
  reactConfig,
  tsConfig,
  ignoreConfig,
  eslintPluginAstro.configs['flat/recommended'],
  eslintPluginPrettier
);
