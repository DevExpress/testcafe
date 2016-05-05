import NODE_VER from '../../utils/node-version';

// NOTE: lazy load heavy dependencies
export default function loadBabelLibs () {
    return {
        babel:             require('babel-core'),
        presetStage2:      require('babel-preset-stage-2'),
        transformRuntime:  require('babel-plugin-transform-runtime'),
        presetES2015Loose: require('babel-preset-es2015-loose'),

        // NOTE: we don't need this preset if we are on older versions of Node
        presetES2015Node4: NODE_VER >= 4 ? require('babel-preset-es2015-node4') : null
    };
}
