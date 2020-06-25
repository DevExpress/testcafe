import path from 'path';
import { zipObject } from 'lodash';
import OS from 'os-family';
import APIBasedTestFileCompilerBase from '../../api-based';
import ESNextTestFileCompiler from '../es-next/compiler';
import TypescriptConfiguration from '../../../../configuration/typescript-configuration';

// NOTE: For type definitions only
import TypeScript, { CompilerOptionsValue } from 'typescript';
import { Dictionary } from '../../../../configuration/interfaces';


declare type TypeScriptInstance = typeof TypeScript;

interface CompilerOptions {
    typeScriptOptions?: {
        tsConfigPath: string;
    };
}

interface TestFileInfo {
    filename: string;
}

declare interface RequireCompilerFunction {
    (code: string, filename: string): string;
}

interface RequireCompilers {
    [extension: string]: RequireCompilerFunction;
}

const RENAMED_DEPENDENCIES_MAP = new Map([['testcafe', APIBasedTestFileCompilerBase.EXPORTABLE_LIB_PATH]]);

export default class TypeScriptTestFileCompiler extends APIBasedTestFileCompilerBase {
    private static tsDefsPath = TypeScriptTestFileCompiler._getTSDefsPath();

    private tsConfig: TypescriptConfiguration;

    public constructor (compilerOptions: CompilerOptions = {}) {
        super();

        const tsConfigPath = compilerOptions.typeScriptOptions ? compilerOptions.typeScriptOptions.tsConfigPath : null;

        this.tsConfig = new TypescriptConfiguration(tsConfigPath);
    }

    private static _normalizeFilename (filename: string): string {
        filename = path.resolve(filename);

        if (OS.win)
            filename = filename.toLowerCase();

        return filename;
    }

    private static _getTSDefsPath (): string {
        return TypeScriptTestFileCompiler._normalizeFilename(path.resolve(__dirname, '../../../../../ts-defs/index.d.ts'));
    }

    private static _reportErrors (diagnostics: Readonly<TypeScript.Diagnostic[]>): void {
        // NOTE: lazy load the compiler
        const ts: TypeScriptInstance = require('typescript');
        let errMsg = 'TypeScript compilation failed.\n';

        diagnostics.forEach(d => {
            const message = ts.flattenDiagnosticMessageText(d.messageText, '\n');
            const file    = d.file;

            if (file && d.start !== void 0) {
                const { line, character } = file.getLineAndCharacterOfPosition(d.start);

                errMsg += `${file.fileName} (${line + 1}, ${character + 1}): `;
            }

            errMsg += `${message}\n`;
        });

        throw new Error(errMsg);
    }

    public _compileCodeForTestFiles (testFilesInfo: TestFileInfo[]): Promise<string[]> {
        return this.tsConfig.init()
            .then(() => {
                return super._compileCodeForTestFiles(testFilesInfo);
            });
    }

    private _compileFilesToCache (ts: TypeScriptInstance, filenames: string[]): void {
        const opts    = this.tsConfig.getOptions() as Dictionary<CompilerOptionsValue>;
        const program = ts.createProgram([TypeScriptTestFileCompiler.tsDefsPath, ...filenames], opts);

        program.getSourceFiles().forEach(sourceFile => {
            // @ts-ignore A hack to allow import globally installed TestCafe in tests
            sourceFile.renamedDependencies = RENAMED_DEPENDENCIES_MAP;
        });

        const diagnostics = ts.getPreEmitDiagnostics(program);

        if (diagnostics.length)
            TypeScriptTestFileCompiler._reportErrors(diagnostics);

        // NOTE: The first argument of emit() is a source file to be compiled. If it's undefined, all files in
        // <program> will be compiled. <program> contains a file specified in createProgram() plus all its dependencies.
        // This mode is much faster than compiling files one-by-one, and it is used in the tsc CLI compiler.
        program.emit(void 0, (outputName, result, writeBOM, onError, sources) => {
            if (!sources)
                return;

            const sourcePath = TypeScriptTestFileCompiler._normalizeFilename(sources[0].fileName);

            this.cache[sourcePath] = result;
        });
    }

    public _precompileCode (testFilesInfo: TestFileInfo[]): string[] {
        // NOTE: lazy load the compiler
        const ts: TypeScriptInstance = require('typescript');

        const filenames              = testFilesInfo.map(({ filename }) => filename);
        const normalizedFilenames    = filenames.map(filename => TypeScriptTestFileCompiler._normalizeFilename(filename));
        const normalizedFilenamesMap = zipObject(normalizedFilenames, filenames);

        const uncachedFiles = normalizedFilenames
            .filter(filename => filename !== TypeScriptTestFileCompiler.tsDefsPath && !this.cache[filename])
            .map(filename => normalizedFilenamesMap[filename]);

        if (uncachedFiles.length)
            this._compileFilesToCache(ts, uncachedFiles);

        return normalizedFilenames.map(filename => this.cache[filename]);
    }

    public _getRequireCompilers (): RequireCompilers {
        return {
            '.ts':  (code, filename) => this._compileCode(code, filename),
            '.tsx': (code, filename) => this._compileCode(code, filename),
            '.js':  (code, filename) => ESNextTestFileCompiler.prototype._compileCode.call(this, code, filename),
            '.jsx': (code, filename) => ESNextTestFileCompiler.prototype._compileCode.call(this, code, filename)
        };
    }

    public get canPrecompile (): boolean {
        return true;
    }

    public getSupportedExtension (): string[] {
        return ['.ts', '.tsx'];
    }
}
