import loadBabelLibs from '../../../babel/load-libs';
import APIBasedTestFileCompilerBase from '../../api-based';
import isFlowCode from './is-flow-code';
import BASE_BABEL_OPTIONS from '../../../babel/get-base-babel-options';
import DISABLE_V8_OPTIMIZATION_NOTE from '../../disable-v8-optimization-note';

const DISABLE_V8_OPTIMIZATION_CODE =
`/*${DISABLE_V8_OPTIMIZATION_NOTE}*/
eval("");
`;

export default class ESNextTestFileCompiler extends APIBasedTestFileCompilerBase {

    static getBabelOptions (filename, code, isCompilerServiceMode) {
        const {
            presetStage2,
            presetFlow,
            transformRuntime,
            presetEnvForTestCode,
            presetReact,
            moduleResolver,
            proposalPrivateMethods,
            proposalClassProperties,
        } = loadBabelLibs(isCompilerServiceMode);

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
        const { babel } = loadBabelLibs();

        if (this.cache[filename])
            return this.cache[filename];

        if (this.isCompilerServiceMode)
            code += DISABLE_V8_OPTIMIZATION_CODE;

        const opts     = ESNextTestFileCompiler.getBabelOptions(filename, code, this.isCompilerServiceMode);
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
