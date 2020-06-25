import loadBabelLibs from '../../../load-babel-libs';
import APIBasedTestFileCompilerBase from '../../api-based';

const BABEL_RUNTIME_RE = /^babel-runtime(\\|\/|$)/;
const FLOW_MARKER_RE   = /^\s*\/\/\s*@flow\s*\n|^\s*\/\*\s*@flow\s*\*\//;

export default class ESNextTestFileCompiler extends APIBasedTestFileCompilerBase {
    static getBabelOptions (filename, code) {
        const { presetStage2, presetFlow, transformRuntime, transformClassProperties, presetEnv, presetReact } = loadBabelLibs();

        // NOTE: passPrePreset and complex presets is a workaround for https://github.com/babel/babel/issues/2877
        // Fixes https://github.com/DevExpress/testcafe/issues/969
        return {
            passPerPreset: true,
            presets:       [
                {
                    passPerPreset: false,
                    presets:       [{ plugins: [transformRuntime] }, presetStage2, presetEnv, presetReact]
                },
                FLOW_MARKER_RE.test(code) ? {
                    passPerPreset: false,
                    presets:       [{ plugins: [transformClassProperties] }, presetFlow]
                } : {}
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
        const { babel } = loadBabelLibs();

        if (this.cache[filename])
            return this.cache[filename];

        const opts     = ESNextTestFileCompiler.getBabelOptions(filename, code);
        const compiled = babel.transform(code, opts);

        this.cache[filename] = compiled.code;

        return compiled.code;
    }

    _getRequireCompilers () {
        return {
            '.js':  (code, filename) => this._compileCode(code, filename),
            '.jsx': (code, filename) => this._compileCode(code, filename),
        };
    }

    getSupportedExtension () {
        return ['.js', '.jsx'];
    }
}
