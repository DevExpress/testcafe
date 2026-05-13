const fs                 = require('fs');
const path               = require('path');
const json5              = require('json5');
const js                 = require('@eslint/js');
const { FlatCompat }     = require('@eslint/eslintrc');

const hammerheadPlugin = require('eslint-plugin-hammerhead');

function wrapLegacyRule (rule) {
    if (typeof rule !== 'function')
        return rule;

    return {
        meta:   {},
        create: rule,
    };
}

hammerheadPlugin.rules = Object.fromEntries(
    Object.entries(hammerheadPlugin.rules).map(([name, rule]) => [name, wrapLegacyRule(rule)])
);

const compat = new FlatCompat({
    baseDirectory:     __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig:         js.configs.all,
});

function readConfig (relativePath) {
    return json5.parse(fs.readFileSync(path.join(__dirname, relativePath), 'utf8'));
}

function scopeConfigs (files, configs) {
    return configs.map(config => ({
        ...config,
        files,
    }));
}

module.exports = [
    {
        ignores: ['test/server/data/**/*.js'],
    },
    ...compat.config(readConfig('.eslintrc')),
    ...scopeConfigs(['examples/**/*.js'], compat.config(readConfig('examples/.eslintrc'))),
    ...scopeConfigs(['src/**/*.{js,ts}'], compat.config(readConfig('src/.eslintrc'))),
    ...scopeConfigs(['src/cli/**/*.{js,ts}'], compat.config(readConfig('src/cli/.eslintrc'))),
    ...scopeConfigs(['src/client/**/*.{js,ts}'], compat.config(readConfig('src/client/.eslintrc'))),
    ...scopeConfigs(['src/client/browser/**/*.{js,ts}'], compat.config(readConfig('src/client/browser/.eslintrc'))),
    ...scopeConfigs(['test/docker/**/*.js'], compat.config(readConfig('test/docker/.eslintrc'))),
    ...scopeConfigs(['test/client/**/*.js'], compat.config(readConfig('test/client/.eslintrc'))),
    ...scopeConfigs(['test/client/fixtures/**/*.js'], compat.config(readConfig('test/client/fixtures/.eslintrc'))),
    ...scopeConfigs(['test/functional/**/*.js'], compat.config(readConfig('test/functional/.eslintrc'))),
    ...scopeConfigs(['test/functional/fixtures/**/*.js'], compat.config(readConfig('test/functional/fixtures/.eslintrc'))),
    ...scopeConfigs(['test/functional/legacy-fixtures/**/*.js'], compat.config(readConfig('test/functional/legacy-fixtures/.eslintrc'))),
    ...scopeConfigs(['test/server/**/*.js'], compat.config(readConfig('test/server/.eslintrc'))),
    {
        files:           ['src/client/rollup.config.js'],
        languageOptions: {
            globals: {
                __dirname:     'readonly',
                __filename:    'readonly',
                Buffer:        'readonly',
                clearInterval: 'readonly',
                clearTimeout:  'readonly',
                global:        'readonly',
                process:       'readonly',
                setInterval:   'readonly',
                setTimeout:    'readonly',
            },
        },
    },
];
