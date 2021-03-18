module.exports = {
  extends: ['@codingsans/eslint-config/typescript-recommended'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: '.',
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  rules: {
    complexity: ['error', 16],
    curly: 'error',
    '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true }],
  },
};
