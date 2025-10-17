import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    ignores: ['node_modules/**', 'dist/**', 'dashboard/**'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.browser },
    rules: {
      'no-undef': 'off',
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    },
  },
]);
