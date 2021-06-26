const colors = require('tailwindcss/colors');

module.exports = {
    mode: 'jit',
    purge: ['./index.html', './src-vite/**/*.tsx'],
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            colors: {
                'brand-user': '#49A4BC',
                'brand-user-light': colors.cyan['600'],
                'brand-user-light-2': '#DFF4F6',
                'brand-user-light-3': '#E2F0F3',
                'brand-user-dark': colors.cyan['800'],
                'brand-provider': '#E55381',
                'brand-provider-light': '#F4B8CB',
                'brand-provider-light-2': '#FCF2F2',
                'brand-provider-light-3': '#FCEDF2',
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [require('@tailwindcss/forms')],
};
