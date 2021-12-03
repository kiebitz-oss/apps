/* eslint-env node */
module.exports = {
    extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended',
        'plugin:prettier/recommended',
        // 'plugin:tailwindcss/recommended',
    ],
    plugins: ['@typescript-eslint'],
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
    },
    env: {
        browser: true,
        es6: true,
    },
    settings: {
        react: {
            version: 'detect',
        },
        tailwindcss: {
            groupByResponsive: true,
        },
    },
    rules: {
        'no-redeclare': 'off',
        'tailwindcss/no-custom-classname': 'off',
        'react/prop-types': 'off',
        ' react/no-unescaped-entities': 'off',
    },
};
