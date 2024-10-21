import getExportableLibPath from '../test-file/get-exportable-lib-path';

function getPresetEnvForTestCodeOpts (dontUseModules) {
    const opts = {
        targets: { node: 'current' },
        loose:   true,
        exclude: ['transform-regenerator'],
    };

    if (dontUseModules)
        opts.modules = false;

    return opts;
}

function getPresetEnvForClientFunctionOpts () {
    return {
        loose:   true,
        exclude: ['transform-typeof-symbol', 'transform-for-of'],
    };
}

function getModuleResolverOpts (esm) {
    return {
        resolvePath (source) {
            //NOTE: Prevent module caching to import 'fixture' and 'test' in ESM mode.
            if (source === 'testcafe')
                return getExportableLibPath(esm);

            return source;
        },
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
        'helpers': false,
    };
}

function getPresetReact () {
    const presetReact = require('@babel/preset-react');

    presetReact.presets = []; // disables flow so it doesn't confict w/ presetFlow

    return presetReact;
}

// NOTE: lazy load heavy dependencies
export default function loadLibs ({ esm } = {}) {
    return {
        babel:                      require('@babel/core'),
        presetStage2:               require('./preset-stage-2'),
        presetFlow:                 require('@babel/preset-flow'),
        transformRuntime:           [require('@babel/plugin-transform-runtime'), getTransformRuntimeOpts()],
        transformForOfAsArray:      [require('@babel/plugin-transform-for-of'), getTransformForOfOptions()],
        presetEnvForClientFunction: [require('@babel/preset-env'), getPresetEnvForClientFunctionOpts()],
        presetEnvForTestCode:       [require('@babel/preset-env'), getPresetEnvForTestCodeOpts(esm)],
        moduleResolver:             [require('babel-plugin-module-resolver'), getModuleResolverOpts(esm)],
        presetReact:                getPresetReact(),
        transformPrivateMethods:    [require('@babel/plugin-transform-private-methods'), { loose: true }],
        transformClassProperties:   [require('@babel/plugin-transform-class-properties'), { loose: true }],
        transformClassStaticBlock:  require('@babel/plugin-transform-class-static-block'),
    };
}
