import {
    dirname,
    relative,
    sep as pathSep,
} from 'path';

import { readFileSync } from 'fs';
import stripBom from 'strip-bom';
import { nanoid } from 'nanoid';
import TestFileCompilerBase from './base';
import TestFile from '../../api/structure/test-file';
import Fixture from '../../api/structure/fixture';
import Test from '../../api/structure/test';
import {
    TestCompilationError,
    APIError,
    ImportESMInCommonJSError,
} from '../../errors/runtime';
import stackCleaningHook from '../../errors/stack-cleaning-hook';
import NODE_MODULES from '../../utils/node-modules-folder-name';
import cacheProxy from './cache-proxy';
import exportableLib from '../../api/exportable-lib';
import TEST_FILE_TEMP_VARIABLE_NAME from './test-file-temp-variable-name';
import addExportAPI from './add-export-api';
import url from 'url';
import PREVENT_MODULE_CACHING_SUFFIX from '../prevent-module-caching-suffix';


const CWD = process.cwd();

const FIXTURE_RE = /(^|;|\s+)fixture\s*(\.|\(|`)/;
const TEST_RE    = /(^|;|\s+)test\s*(\.|\()/;

const TESTCAFE_LIB_FOLDER_NAME = 'lib';

const Module = module.constructor;

const errRequireEsmErrorCode = 'ERR_REQUIRE_ESM';

export default class APIBasedTestFileCompilerBase extends TestFileCompilerBase {
    constructor ({ isCompilerServiceMode, baseUrl, experimentalEsm }) {
        super({ baseUrl });

        this.isCompilerServiceMode = isCompilerServiceMode;
        this.cache                 = Object.create(null);
        this.origRequireExtensions = Object.create(null);
        this.cachePrefix           = nanoid(7);
        this.experimentalEsm       = experimentalEsm;
    }

    static _getNodeModulesLookupPath (filename) {
        const dir = dirname(filename);

        return Module._nodeModulePaths(dir);
    }

    static _isNodeModulesDep (filename) {
        return relative(CWD, filename)
            .split(pathSep)
            .includes(NODE_MODULES);
    }

    static _isTestCafeLibDep (filename) {
        return relative(CWD, filename)
            .split(pathSep)
            .includes(TESTCAFE_LIB_FOLDER_NAME);
    }

    async _execAsModule (code, filename) {
        if (this.experimentalEsm) {
            const fileUrl = url.pathToFileURL(filename);

            //NOTE: It is necessary to prevent module caching during live mode.
            // eslint-disable-next-line no-eval
            await eval(`import('${fileUrl}?${PREVENT_MODULE_CACHING_SUFFIX}=${Date.now()}')`);
        }
        else {
            const mod = new Module(filename, module.parent);

            mod.filename = filename;
            mod.paths    = APIBasedTestFileCompilerBase._getNodeModulesLookupPath(filename);

            cacheProxy.startExternalCaching(this.cachePrefix);

            mod._compile(code, filename);

            cacheProxy.stopExternalCaching();
        }
    }

    _compileCode (code, filename) {
        if (this.canPrecompile)
            return this._precompileCode([{ code, filename }])[0];

        throw new Error('Not implemented');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _precompileCode (testFilesInfo) {
        throw new Error('Not implemented');
    }

    _getRequireCompilers () {
        throw new Error('Not implemented');
    }

    _compileExternalModule (mod, filename, requireCompiler, origExt) {
        if (APIBasedTestFileCompilerBase._isNodeModulesDep(filename) && origExt)
            origExt( mod, filename );
        else
            this._compileModule(mod, filename, requireCompiler, origExt);
    }

    _compileExternalModuleInEsmMode (mod, filename, requireCompiler, origExt) {
        if (!origExt)
            origExt = this.origRequireExtensions['.js'];

        if (!APIBasedTestFileCompilerBase._isNodeModulesDep(filename) &&
            !APIBasedTestFileCompilerBase._isTestCafeLibDep(filename)) {
            global.customExtensionHook = () => {
                global.customExtensionHook = null;

                this._compileModule(mod, filename, requireCompiler);
            };
        }

        return origExt(mod, filename);
    }


    _compileModule (mod, filename, requireCompiler) {
        const code         = readFileSync(filename).toString();
        const compiledCode = requireCompiler(stripBom(code), filename);

        mod.paths = APIBasedTestFileCompilerBase._getNodeModulesLookupPath(filename);

        mod._compile(compiledCode, filename);
    }

    _setupRequireHook (testFile) {
        const requireCompilers = this._getRequireCompilers();

        this.origRequireExtensions = Object.create(null);

        Object.keys(requireCompilers).forEach(ext => {
            const origExt = require.extensions[ext];

            this.origRequireExtensions[ext] = origExt;

            require.extensions[ext] = (mod, filename) => {
                const hadGlobalAPI = this._hasGlobalAPI();

                // NOTE: remove global API so that it will be unavailable for the dependencies
                if (APIBasedTestFileCompilerBase._isNodeModulesDep(filename) && hadGlobalAPI)
                    this._removeGlobalAPI();

                if (this.isCompilerServiceMode)
                    this._compileExternalModuleInEsmMode(mod, filename, requireCompilers[ext], origExt);
                else
                    this._compileExternalModule(mod, filename, requireCompilers[ext], origExt);

                if (hadGlobalAPI && !this._hasGlobalAPI())
                    this._addGlobalAPI(testFile);
            };
        });
    }

    _removeRequireHook () {
        Object.keys(this.origRequireExtensions).forEach(ext => {
            require.extensions[ext] = this.origRequireExtensions[ext];
        });
    }

    _compileCodeForTestFiles (testFilesInfo) {
        stackCleaningHook.enabled = true;

        try {
            if (this.canPrecompile)
                return this._precompileCode(testFilesInfo);

            return testFilesInfo.map(({ code, filename }) => this._compileCode(code, filename));
        }
        catch (err) {
            throw new TestCompilationError(stackCleaningHook.cleanError(err));
        }
        finally {
            stackCleaningHook.enabled = false;
        }
    }

    _addGlobalAPI (testFile) {
        Object.defineProperty(global, 'fixture', {
            get:          () => new Fixture(testFile, this.baseUrl),
            configurable: true,
        });

        Object.defineProperty(global, 'test', {
            get:          () => new Test(testFile, false, this.baseUrl),
            configurable: true,
        });
    }

    _addExportAPIInCompilerServiceMode (testFile) {
        // 'esm' library has an issue with loading modules
        // in case of the combination of require and import directives.
        // This hack allowing achieve the desired behavior.
        const exportableLibPath = require.resolve('../../api/exportable-lib');

        delete require.cache[exportableLibPath];

        global[TEST_FILE_TEMP_VARIABLE_NAME] = { testFile, baseUrl: this.baseUrl };

        require('../../api/exportable-lib');
    }

    _addExportAPI (testFile) {
        if (this.isCompilerServiceMode)
            this._addExportAPIInCompilerServiceMode(testFile);
        else
            addExportAPI(testFile, exportableLib, { baseUrl: this.baseUrl });
    }

    _removeGlobalAPI () {
        delete global.fixture;
        delete global.test;
    }

    _hasGlobalAPI () {
        return global.fixture && global.test;
    }

    async _runCompiledCode (compiledCode, filename) {
        const testFile = new TestFile(filename);

        this._addGlobalAPI(testFile);
        this._addExportAPI(testFile);

        stackCleaningHook.enabled = true;

        this._setupRequireHook(testFile);

        try {
            await this._execAsModule(compiledCode, filename);
        }
        catch (err) {
            if (err.code === errRequireEsmErrorCode)
                throw new ImportESMInCommonJSError(err, filename);

            if (!(err instanceof APIError))
                throw new TestCompilationError(stackCleaningHook.cleanError(err));

            throw err;
        }
        finally {
            this._removeRequireHook();
            stackCleaningHook.enabled = false;

            if (!this.experimentalEsm)
                this._removeGlobalAPI();
        }

        return testFile.getTests();
    }


    precompile (testFilesInfo) {
        return this._compileCodeForTestFiles(testFilesInfo);
    }

    execute (compiledCode, filename) {
        return this._runCompiledCode(compiledCode, filename);
    }

    async compile (code, filename) {
        const [compiledCode] = await this.precompile([{ code, filename }]);

        if (compiledCode)
            return this.execute(compiledCode, filename);

        return Promise.resolve();
    }

    _hasTests (code) {
        return FIXTURE_RE.test(code) && TEST_RE.test(code);
    }

    cleanUp () {
        this.cache = {};
    }
}
