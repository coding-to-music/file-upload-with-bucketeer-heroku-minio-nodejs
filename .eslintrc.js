module.exports = {
  extends: ['@codingsans/eslint-config/typescript-recommended'],
  rules: {
    complexity: ['error', 6],
    curly: 'error',
  },
  parserOptions: {
    project: 'tsconfig.json',
  },
};
