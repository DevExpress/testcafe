import loadBabelLibs from '../../../babel/load-libs';
import APIBasedTestFileCompilerBase from '../../api-based';
import isFlowCode from './is-flow-code';
import BASE_BABEL_OPTIONS from '../../../babel/get-base-babel-options';
import DISABLE_V8_OPTIMIZATION_NOTE from '../../disable-v8-optimization-note';
import Extensions from '../extensions';

//NOTE: The semicolon ; prevents the declaration from being bound with eval
const DISABLE_V8_OPTIMIZATION_CODE =
`;/*${DISABLE_V8_OPTIMIZATION_NOTE}*/
eval("");
`;

export default class ESNextTestFileCompiler extends APIBasedTestFileCompilerBase {

    static getBabelOptions (filename, code, { esm } = {}) {
        const {
            presetStage2,
            presetFlow,
            transformRuntime,
            presetEnvForTestCode,
            presetReact,
            moduleResolver,
            transformPrivateMethods,
            transformClassProperties,
            transformClassStaticBlock,
        } = loadBabelLibs({ esm });

        const opts = Object.assign({}, BASE_BABEL_OPTIONS, {
            presets:    [presetStage2, presetEnvForTestCode, presetReact],
            plugins:    [transformRuntime, moduleResolver, transformPrivateMethods, transformClassProperties, transformClassStaticBlock],
            sourceMaps: 'inline',
            filename,
        });

        if (isFlowCode(code))
            opts.presets.push(presetFlow);

        return opts;
    }

    _compileCode (code, filename) {
        const { babel } = loadBabelLibs(this);

        if (this.cache[filename])
            return this.cache[filename];

        if (this.esm)
            code += DISABLE_V8_OPTIMIZATION_CODE;

        const opts     = ESNextTestFileCompiler.getBabelOptions(filename, code, this);
        const compiled = babel.transform(code, opts);

        this.cache[filename] = compiled.code;

        return compiled.code;
    }

    _getRequireCompilers () {
        const requireCompilers = {
            [Extensions.js]:  (code, filename) => this._compileCode(code, filename),
            [Extensions.jsx]: (code, filename) => this._compileCode(code, filename),
            [Extensions.cjs]: (code, filename) => this._compileCode(code, filename),
        };

        if (this.esm)
            requireCompilers[Extensions.mjs] = (code, filename) => this._compileCode(code, filename);

        return requireCompilers;
    }

    get canCompileInEsm () {
        return true;
    }

    getSupportedExtension () {
        const supportedExtensions = [Extensions.js, Extensions.jsx, Extensions.cjs, Extensions.mjs];

        return supportedExtensions;
    }
}
