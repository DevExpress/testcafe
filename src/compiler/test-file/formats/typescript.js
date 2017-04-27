import APIBasedTestFileCompilerBase from '../api-based';
import ESNextTestFileCompiler from './es-next';

export default class TypeScriptTestFileCompiler extends APIBasedTestFileCompilerBase {
    static _getTypescriptOptions () {
        // NOTE: lazy load the compiler
        var ts = require('typescript');

        return {
            pretty:          true,
            inlineSourceMap: true,
            noEmit:          true,
            noImplicitAny:   true,
            module:          ts.ModuleKind.CommonJS,
            target:          'ES6',
            lib:             ['lib.es6.d.ts'],
            baseUrl:         __dirname,
            paths:           {
                testcafe: ['../../../api/exportable-lib']
            }
        };
    }

    static _reportErrors (diagnostics) {
        // NOTE: lazy load the compiler
        var ts     = require('typescript');
        var errMsg = '';

        diagnostics.forEach(d => {
            var file                = d.file;
            var { line, character } = file.getLineAndCharacterOfPosition(d.start);
            var message             = ts.flattenDiagnosticMessageText(d.messageText, '\n');

            errMsg += `${file.fileName} (${line}, ${character}): ${message}\n`;
        });

        var err = new Error(errMsg);

        err.stack = errMsg;

        throw err;
    }

    _compileCode (code, filename) {
        // NOTE: lazy load the compiler
        var ts = require('typescript');

        if (this.cache[filename])
            return this.cache[filename];

        var opts        = TypeScriptTestFileCompiler._getTypescriptOptions();
        var program     = ts.createProgram([filename], opts);
        var diagnostics = ts.getPreEmitDiagnostics(program);

        if (diagnostics.length)
            TypeScriptTestFileCompiler._reportErrors(diagnostics);

        var result = ts.transpileModule(code, {
            fileName:        filename,
            compilerOptions: opts
        });

        this.cache[filename] = result;

        return result.outputText;
    }

    _getRequireCompilers () {
        return {
            '.ts': (code, filename) => this._compileCode(code, filename),
            '.js': (code, filename) => ESNextTestFileCompiler.prototype._compileCode.call(this, code, filename)
        };
    }

    getSupportedExtension () {
        return '.ts';
    }
}
