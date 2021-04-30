import EXPORTABLE_LIB_PATH from '../test-file/exportble-lib-path';

function getPresetEnvForTestCodeOpts () {
    return {
        targets: { node: 'current' },
        loose:   true,
        exclude: ['transform-regenerator']
    };
}

function getPresetEnvForClientFunctionOpts () {
    return {
        loose:   true,
        exclude: ['transform-typeof-symbol', 'transform-for-of']
    };
}

function getModuleResolverOpts () {
    return {
        resolvePath (source) {
            if (source === 'testcafe')
                return EXPORTABLE_LIB_PATH;

            return source;
        }
    };
}

function getTransformForOfOptions () {
    // NOTE: allowArrayLike is required to allow iterating non-iterable objects (e.g. NodeList)
    // to preserve compatibility with older TestCafe code
    return { loose: true, allowArrayLike: true };
}

function getTransformRuntimeOpts () {
    // NOTE: We are forced to import helpers to each compiled file
    // because of '@babel/plugin-transform-runtime' plugin cannot correctly resolve path
    // to the helpers from the '@babel/runtime' module.
    return {
        'helpers': false
    };
}

function getPresetReact () {
    const presetReact = require('@babel/preset-react');

    presetReact.presets = []; // disables flow so it doesn't confict w/ presetFlow

    return presetReact;
}

// NOTE: lazy load heavy dependencies
export default function loadLibs () {
    return {
        babel:                      require('@babel/core'),
        presetStage2:               require('./preset-stage-2'),
        presetFlow:                 require('@babel/preset-flow'),
        transformRuntime:           [require('@babel/plugin-transform-runtime'), getTransformRuntimeOpts()],
        transformForOfAsArray:      [require('@babel/plugin-transform-for-of'), getTransformForOfOptions()],
        presetEnvForClientFunction: [require('@babel/preset-env'), getPresetEnvForClientFunctionOpts()],
        presetEnvForTestCode:       [require('@babel/preset-env'), getPresetEnvForTestCodeOpts()],
        moduleResolver:             [require('babel-plugin-module-resolver'), getModuleResolverOpts()],
        presetReact:                getPresetReact(),
        proposalPrivateMethods:     [require('@babel/plugin-proposal-private-methods'), { loose: true }],
        proposalClassProperties:    [require('@babel/plugin-proposal-class-properties'), { loose: true }]
    };
}
