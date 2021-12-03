// This is the configuration file for babel
/* eslint-env node */
module.exports = {
    presets: [
        '@babel/preset-env',
        [
            '@babel/preset-react',
            {
                runtime: 'automatic',
                development: process.env.BABEL_ENV === 'development',
            },
        ],
        '@babel/preset-typescript',
    ],
    plugins: [
        '@babel/plugin-proposal-class-static-block',
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-transform-async-to-generator',
        '@babel/plugin-proposal-object-rest-spread',
        'macros',
    ],
};
