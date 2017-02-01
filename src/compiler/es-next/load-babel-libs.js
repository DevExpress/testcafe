// NOTE: lazy load heavy dependencies
export default function loadBabelLibs () {
    return {
        babel:            require('babel-core'),
        presetStage2:     require('babel-preset-stage-2'),
        transformRuntime: require('babel-plugin-transform-runtime'),
        presetFallback:   require('babel-preset-env').default(null, { loose: true }),
        presetEnv:        require('babel-preset-env').default(null, { targets: { node: 'current' }, loose: true })
    };
}
