'use strict';

exports.__esModule = true;
exports.default = loadBabelLibs;
function getOptsForPresetEnv() {
    return {
        targets: { node: 'current' },
        loose: true,
        exclude: ['transform-regenerator']
    };
}

// NOTE: lazy load heavy dependencies
function loadBabelLibs() {
    return {
        babel: require('babel-core'),
        presetStage2: require('babel-preset-stage-2'),
        presetFlow: require('babel-preset-flow'),
        transformClassProperties: require('babel-plugin-transform-class-properties'),
        transformRuntime: require('babel-plugin-transform-runtime'),
        presetFallback: require('babel-preset-env').default(null, { loose: true }),
        presetEnv: require('babel-preset-env').default(null, getOptsForPresetEnv())
    };
}
module.exports = exports['default'];