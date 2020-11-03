import path from 'path';
import { zipObject } from 'lodash';
import OS from 'os-family';
import APIBasedTestFileCompilerBase from '../../api-based';
import ESNextTestFileCompiler from '../es-next/compiler';
import TypescriptConfiguration from '../../../../configuration/typescript-configuration';
import { GeneralError } from '../../../../errors/runtime';
import { RUNTIME_ERRORS } from '../../../../errors/types';
import debug from 'debug';
import { isRelative } from '../../../../api/test-page-url';
import EXPORTABLE_LIB_PATH from '../../exportble-lib-path';

// NOTE: For type definitions only
import TypeScript, { CompilerOptionsValue } from 'typescript';
import { Dictionary, TypeScriptCompilerOptions } from '../../../../configuration/interfaces';


declare type TypeScriptInstance = typeof TypeScript;

interface TestFileInfo {
    filename: string;
}

declare interface RequireCompilerFunction {
    (code: string, filename: string): string;
}

interface RequireCompilers {
    [extension: string]: RequireCompilerFunction;
}

const DEBUG_LOGGER = debug('testcafe:compiler:typescript');

const RENAMED_DEPENDENCIES_MAP = new Map([['testcafe', EXPORTABLE_LIB_PATH]]);

const DEFAULT_TYPESCRIPT_COMPILER_PATH = 'typescript';

export default class TypeScriptTestFileCompiler extends APIBasedTestFileCompilerBase {
    private static tsDefsPath = TypeScriptTestFileCompiler._getTSDefsPath();

    private readonly _tsConfig: TypescriptConfiguration;
    private readonly _compilerPath: string;
    private readonly _customCompilerOptions?: object;

    public constructor (compilerOptions?: TypeScriptCompilerOptions) {
        super();

        // NOTE: At present, it's necessary create an instance TypeScriptTestFileCompiler
        // to collect a list of supported test file extensions.
        // So all compilers creates 2 times: first time - for collecting all supported file extensions,
        // second one - for compiling tests.
        // In future, need to rewrite 'getSupportedExtension' method as static.

        const configPath = compilerOptions && compilerOptions.configPath || null;

        this._customCompilerOptions = compilerOptions && compilerOptions.options;
        this._tsConfig              = new TypescriptConfiguration(configPath);
        this._compilerPath          = TypeScriptTestFileCompiler._getCompilerPath(compilerOptions);
    }

    private static _getCompilerPath (compilerOptions?: TypeScriptCompilerOptions): string {
        let compilerPath = compilerOptions && compilerOptions.customCompilerModulePath;

        if (!compilerPath || compilerPath === DEFAULT_TYPESCRIPT_COMPILER_PATH)
            return DEFAULT_TYPESCRIPT_COMPILER_PATH;

        // NOTE: if the relative path to custom TypeScript compiler module is specified
        // then we will resolve the path from the root of the 'testcafe' module
        if (isRelative(compilerPath)) {
            const testcafeRootFolder = path.resolve(__dirname, '../../../../../');

            compilerPath = path.resolve(testcafeRootFolder, compilerPath);
        }

        return compilerPath;
    }

    private _loadTypeScriptCompiler (): TypeScriptInstance {
        try {
            return require(this._compilerPath);
        }
        catch (err) {
            throw new GeneralError(RUNTIME_ERRORS.typeScriptCompilerLoadingError, err.message);
        }
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

    private _reportErrors (diagnostics: Readonly<TypeScript.Diagnostic[]>): void {
        // NOTE: lazy load the compiler
        const ts: TypeScriptInstance = this._loadTypeScriptCompiler();
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
        return this._tsConfig.init(this._customCompilerOptions)
            .then(() => {
                return super._compileCodeForTestFiles(testFilesInfo);
            });
    }

    private _compileFilesToCache (ts: TypeScriptInstance, filenames: string[]): void {
        const opts    = this._tsConfig.getOptions() as Dictionary<CompilerOptionsValue>;
        const program = ts.createProgram([TypeScriptTestFileCompiler.tsDefsPath, ...filenames], opts);

        DEBUG_LOGGER('version: %s', ts.version);
        DEBUG_LOGGER('options: %O', opts);

        program.getSourceFiles().forEach(sourceFile => {
            // @ts-ignore A hack to allow import globally installed TestCafe in tests
            sourceFile.renamedDependencies = RENAMED_DEPENDENCIES_MAP;
        });

        const diagnostics = ts.getPreEmitDiagnostics(program);

        if (diagnostics.length)
            this._reportErrors(diagnostics);

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
        DEBUG_LOGGER('path: "%s"', this._compilerPath);

        // NOTE: lazy load the compiler
        const ts: TypeScriptInstance = this._loadTypeScriptCompiler();
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
