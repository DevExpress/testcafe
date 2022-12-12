import loadBabelLibs from '../../../babel/load-libs';
import APIBasedTestFileCompilerBase from '../../api-based';
import isFlowCode from './is-flow-code';
import BASE_BABEL_OPTIONS from '../../../babel/get-base-babel-options';
import DISABLE_V8_OPTIMIZATION_NOTE from '../../disable-v8-optimization-note';

//NOTE: We should put ; before otherwise if last declaration without ; bounded with eval
const DISABLE_V8_OPTIMIZATION_CODE =
`;/*${DISABLE_V8_OPTIMIZATION_NOTE}*/
eval("");
`;

export default class ESNextTestFileCompiler extends APIBasedTestFileCompilerBase {

    static getBabelOptions (filename, code, isCompilerServiceMode, experimentalEsm) {
        const {
            presetStage2,
            presetFlow,
            transformRuntime,
            presetEnvForTestCode,
            presetReact,
            moduleResolver,
            proposalPrivateMethods,
            proposalClassProperties,
        } = loadBabelLibs(isCompilerServiceMode, experimentalEsm);

        const opts = Object.assign({}, BASE_BABEL_OPTIONS, {
            presets:    [presetStage2, presetEnvForTestCode, presetReact],
            plugins:    [transformRuntime, moduleResolver, proposalPrivateMethods, proposalClassProperties],
            sourceMaps: 'inline',
            filename,
        });

        if (isFlowCode(code))
            opts.presets.push(presetFlow);

        return opts;
    }

    _compileCode (code, filename) {
        const { babel } = loadBabelLibs(this.isCompilerServiceMode, this.experimentalEsm);

        if (this.cache[filename])
            return this.cache[filename];

        if (this.isCompilerServiceMode || this.experimentalEsm)
            code += DISABLE_V8_OPTIMIZATION_CODE;

        const opts     = ESNextTestFileCompiler.getBabelOptions(filename, code, this.isCompilerServiceMode, this.experimentalEsm);
        const compiled = babel.transform(code, opts);

        this.cache[filename] = compiled.code;

        return compiled.code;
    }

    _getRequireCompilers () {
        const requireCompilers = {
            '.js':  (code, filename) => this._compileCode(code, filename),
            '.jsx': (code, filename) => this._compileCode(code, filename),
            '.cjs': (code, filename) => this._compileCode(code, filename),
        };

        if (this.experimentalEsm)
            requireCompilers['.mjs'] = (code, filename) => this._compileCode(code, filename);

        return requireCompilers;
    }

    get canCompileInEsm () {
        return true;
    }

    getSupportedExtension () {
        const supportedExtensions = ['.js', '.jsx', '.cjs'];

        if (this.experimentalEsm)
            supportedExtensions.push('.mjs');

        return supportedExtensions;
    }
}
