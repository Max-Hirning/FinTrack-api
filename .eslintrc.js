module.exports = {
  env: {
    node: true,
    jest: true,
  },
  rules: {
    "no-console": 2,
    "indent": ["error", 2],
    "space-before-blocks": 2,
    "semi": ["error", "always"],
    "no-multi-spaces": ["error"],
    "quotes": ["error", "single"],
    "keyword-spacing": ["error", {
      before: true,
      after: true,
      overrides: {
        if: { after: false },
        for: { after: false }
      }
    }],
    "linebreak-style": ["error", "windows"],
    "object-curly-spacing": ["error", "never"],
    '@typescript-eslint/no-explicit-any': 'error',
    "@typescript-eslint/space-before-blocks": "error",
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: [
    '@typescript-eslint/eslint-plugin',
  ],
  root: true,
  parserOptions: {
    sourceType: 'module',
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: [
    '.eslintrc.js'
  ],
  parser: '@typescript-eslint/parser',
};