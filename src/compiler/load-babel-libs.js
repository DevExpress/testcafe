function getOptsForPresetEnv () {
    return {
        targets: { node: 'current' },
        loose:   true,
        exclude: ['transform-regenerator']
    };
}

function getOptsForPresetFallback () {
    return {
        loose:   true,
        exclude: ['transform-es2015-typeof-symbol']
    };
}

// NOTE: lazy load heavy dependencies
export default function loadBabelLibs () {
    const presetReact = require('babel-preset-react');

    presetReact.presets = []; // disables flow so it doesn't confict w/ presetFlow
    return {
        babel:                    require('babel-core'),
        presetStage2:             require('babel-preset-stage-2'),
        presetFlow:               require('babel-preset-flow'),
        transformClassProperties: require('babel-plugin-transform-class-properties'),
        transformRuntime:         require('babel-plugin-transform-runtime'),
        transformForOfAsArray:    require('babel-plugin-transform-for-of-as-array').default,
        presetFallback:           require('babel-preset-env').default(null, getOptsForPresetFallback()),
        presetEnv:                require('babel-preset-env').default(null, getOptsForPresetEnv()),
        presetReact,
    };
}
