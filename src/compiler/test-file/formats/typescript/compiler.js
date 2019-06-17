import path from 'path';
import { zipObject } from 'lodash';
import OS from 'os-family';
import APIBasedTestFileCompilerBase from '../../api-based';
import ESNextTestFileCompiler from '../es-next/compiler';
import TypescriptConfiguration from '../../../../configuration/typescript-configuration';

const RENAMED_DEPENDENCIES_MAP = new Map([['testcafe', APIBasedTestFileCompilerBase.EXPORTABLE_LIB_PATH]]);
const tsDefsPath               = path.resolve(__dirname, '../../../../../ts-defs/index.d.ts');

export default class TypeScriptTestFileCompiler extends APIBasedTestFileCompilerBase {
    constructor ({ typeScriptOptions } = {}) {
        super();

        const tsConfigPath = typeScriptOptions ? typeScriptOptions.tsConfigPath : null;

        this.tsConfig = new TypescriptConfiguration(tsConfigPath);
    }

    static _reportErrors (diagnostics) {
        // NOTE: lazy load the compiler
        const ts     = require('typescript');
        let errMsg = 'TypeScript compilation failed.\n';

        diagnostics.forEach(d => {
            const message = ts.flattenDiagnosticMessageText(d.messageText, '\n');
            const file    = d.file;

            if (file) {
                const { line, character } = file.getLineAndCharacterOfPosition(d.start);

                errMsg += `${file.fileName} (${line + 1}, ${character + 1}): `;
            }

            errMsg += `${message}\n`;
        });

        throw new Error(errMsg);
    }

    static _normalizeFilename (filename) {
        filename = path.resolve(filename);

        if (OS.win)
            filename = filename.toLowerCase();

        return filename;
    }

    _compileCodeForTestFiles (testFilesInfo) {
        return this.tsConfig.init()
            .then(() => {
                return super._compileCodeForTestFiles(testFilesInfo);
            });
    }

    _precompileCode (testFilesInfo) {
        // NOTE: lazy load the compiler
        const ts = require('typescript');

        const filenames              = testFilesInfo.map(({ filename }) => filename).concat([tsDefsPath]);
        const normalizedFilenames    = filenames.map(filename => TypeScriptTestFileCompiler._normalizeFilename(filename));
        const normalizedFilenamesMap = zipObject(normalizedFilenames, filenames);

        const uncachedFiles = normalizedFilenames
            .filter(filename => !this.cache[filename])
            .map(filename => normalizedFilenamesMap[filename]);

        const opts    = this.tsConfig.getOptions();
        const program = ts.createProgram(uncachedFiles, opts);

        program.getSourceFiles().forEach(sourceFile => {
            sourceFile.renamedDependencies = RENAMED_DEPENDENCIES_MAP;
        });

        const diagnostics = ts.getPreEmitDiagnostics(program);

        if (diagnostics.length)
            TypeScriptTestFileCompiler._reportErrors(diagnostics);

        // NOTE: The first argument of emit() is a source file to be compiled. If it's undefined, all files in
        // <program> will be compiled. <program> contains a file specified in createProgram() plus all its dependencies.
        // This mode is much faster than compiling files one-by-one, and it is used in the tsc CLI compiler.
        program.emit(void 0, (outputName, result, writeBOM, onError, sources) => {
            const sourcePath = TypeScriptTestFileCompiler._normalizeFilename(sources[0].fileName);

            this.cache[sourcePath] = result;
        });

        return normalizedFilenames.map(filename => this.cache[filename]);
    }

    _getRequireCompilers () {
        return {
            '.ts': (code, filename) => this._compileCode(code, filename),
            '.js': (code, filename) => ESNextTestFileCompiler.prototype._compileCode.call(this, code, filename)
        };
    }

    get canPrecompile () {
        return true;
    }

    getSupportedExtension () {
        return '.ts';
    }
}
