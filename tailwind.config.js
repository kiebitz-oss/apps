/* eslint-env node */
const colors = require('tailwindcss/colors');

module.exports = {
    mode: 'jit',
    content: ['./src/**/*.tsx', './src/**/*.jsx'],

    theme: {
        container: {
            center: true,
            padding: {
                DEFAULT: '1rem',
                sm: '2rem',
                lg: '4rem',
                xl: '5rem',
                '2xl': '6rem',
            },
        },

        extend: {
            colors: {
                primary: colors.green,
                secondary: colors.indigo,
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms')({
            strategy: 'class',
        }),
    ],
};
