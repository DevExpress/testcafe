import NODE_VER from '../utils/node-version';

function getOptsForPresetEnv () {
    var opts = { targets: { node: 'current' }, loose: true };

    // NOTE: Disable transforming generators into state-machine for node>=4, because this versions have native generators.
    // Also this versions have native template literals, regenerator do not work with them:
    // https://github.com/facebook/regenerator/issues/276
    if (NODE_VER >= 4)
        opts.exclude = ['transform-regenerator'];

    return opts;
}

// NOTE: lazy load heavy dependencies
export default function loadBabelLibs () {
    return {
        babel:                    require('babel-core'),
        presetStage2:             require('babel-preset-stage-2'),
        presetFlow:               require('babel-preset-flow'),
        transformClassProperties: require('babel-plugin-transform-class-properties'),
        transformRuntime:         require('babel-plugin-transform-runtime'),
        presetFallback:           require('babel-preset-env').default(null, { loose: true }),
        presetEnv:                require('babel-preset-env').default(null, getOptsForPresetEnv())
    };
}
