import loadBabelLibs from '../../../babel/load-libs';
import APIBasedTestFileCompilerBase from '../../api-based';

const FLOW_MARKER_RE   = /^\s*\/\/\s*@flow\s*\n|^\s*\/\*\s*@flow\s*\*\//;

function isFlowCode (code) {
    return FLOW_MARKER_RE.test(code);
}

export default class ESNextTestFileCompiler extends APIBasedTestFileCompilerBase {
    static getBabelOptions (filename, code) {
        const {
            presetStage2,
            presetFlow,
            transformRuntime,
            presetEnvForTestCode,
            presetReact,
            moduleResolver
        } = loadBabelLibs();

        const opts = {
            presets:       [presetStage2, presetEnvForTestCode, presetReact],
            plugins:       [transformRuntime, moduleResolver],
            filename:      filename,
            retainLines:   true,
            sourceMaps:    'inline',
            ast:           false,
            babelrc:       false,
            highlightCode: false
        };

        if (isFlowCode(code))
            opts.presets.push(presetFlow);

        return opts;
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
