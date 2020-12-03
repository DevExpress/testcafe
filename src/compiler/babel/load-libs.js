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
        exclude: ['transform-typeof-symbol']
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
        transformForOfAsArray:      require('babel-plugin-transform-for-of-as-array').default,
        presetEnvForClientFunction: [require('@babel/preset-env'), getPresetEnvForClientFunctionOpts()],
        presetEnvForTestCode:       [require('@babel/preset-env'), getPresetEnvForTestCodeOpts()],
        moduleResolver:             [require('babel-plugin-module-resolver'), getModuleResolverOpts()],
        presetReact:                getPresetReact()
    };
}
