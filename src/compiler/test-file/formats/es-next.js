import loadBabelLibs from '../../load-babel-libs';
import APIBasedTestFileCompilerBase from '../api-based';

const BABEL_RUNTIME_RE = /^babel-runtime(\\|\/|$)/;
const FLOW_MARKER_RE   = /^\s*\/\/\s*@flow|^\s*\/\*\s*@flow\s*\*\//;

export default class ESNextTestFileCompiler extends APIBasedTestFileCompilerBase {
    static _getBabelOptions (filename, code) {
        var { presetStage2, presetFlow, transformRuntime, presetEnv } = loadBabelLibs();

        var presets = [].concat(
            FLOW_MARKER_RE.test(code) ? [presetFlow] : [],
            [{ plugins: [transformRuntime] }, presetStage2, presetEnv]
        );

        // NOTE: passPrePreset and complex presets is a workaround for https://github.com/babel/babel/issues/2877
        // Fixes https://github.com/DevExpress/testcafe/issues/969
        return {
            passPerPreset: true,
            presets:       [
                {
                    passPerPreset: false,
                    presets:       presets
                }
            ],
            filename:      filename,
            retainLines:   true,
            sourceMaps:    'inline',
            ast:           false,
            babelrc:       false,
            highlightCode: false,

            resolveModuleSource: source => {
                if (source === 'testcafe')
                    return APIBasedTestFileCompilerBase.EXPORTABLE_LIB_PATH;

                if (BABEL_RUNTIME_RE.test(source)) {
                    try {
                        return require.resolve(source);
                    }
                    catch (err) {
                        return source;
                    }
                }

                return source;
            }
        };
    }

    _compileCode (code, filename) {
        var { babel } = loadBabelLibs();

        if (this.cache[filename])
            return this.cache[filename];

        var opts     = ESNextTestFileCompiler._getBabelOptions(filename, code);
        var compiled = babel.transform(code, opts);

        this.cache[filename] = compiled.code;

        return compiled.code;
    }

    _getRequireCompilers () {
        return { '.js': (code, filename) => this._compileCode(code, filename) };
    }

    getSupportedExtension () {
        return '.js';
    }
}
