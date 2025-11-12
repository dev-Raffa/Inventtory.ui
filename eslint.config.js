import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended'
import { defineConfig, globalIgnores } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier/prettier'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
      eslintPluginPrettier
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules:{
      "react-refresh/only-export-components":"off",
      "@typescript-eslint/no-explicit-any": "off",
      "prettier/prettier": [
      'error',
      {
        'endOfLine': 'auto',
      }
    ]
    }
  },
  eslintConfigPrettier
])
