import { dirname, relative, join, sep as pathSep } from 'path';
import { readFileSync } from 'fs';
import stripBom from 'strip-bom';
import TestFileCompilerBase from './base';
import TestFile from '../../api/structure/test-file';
import Fixture from '../../api/structure/fixture';
import Test from '../../api/structure/test';
import { TestCompilationError, APIError } from '../../errors/runtime';
import stackCleaningHook from '../../errors/stack-cleaning-hook';

const CWD = process.cwd();

const EXPORTABLE_LIB_PATH = join(__dirname, '../../api/exportable-lib');

const FIXTURE_RE = /(^|;|\s+)fixture\s*(\.|\(|`)/;
const TEST_RE    = /(^|;|\s+)test\s*(\.|\()/;

var Module = module.constructor;

export default class APIBasedTestFileCompilerBase extends TestFileCompilerBase {
    constructor () {
        super();

        this.cache                 = Object.create(null);
        this.origRequireExtensions = Object.create(null);
    }

    static get EXPORTABLE_LIB_PATH () {
        return EXPORTABLE_LIB_PATH;
    }

    static _getNodeModulesLookupPath (filename) {
        var dir = dirname(filename);

        return Module._nodeModulePaths(dir);
    }

    static _isNodeModulesDep (filename) {
        return relative(CWD, filename)
            .split(pathSep)
            .indexOf('node_modules') >= 0;
    }

    static _execAsModule (code, filename) {
        var mod = new Module(filename, module.parent);

        mod.filename = filename;
        mod.paths    = APIBasedTestFileCompilerBase._getNodeModulesLookupPath(filename);

        mod._compile(code, filename);
    }

    _compileCode (/* code, filename */) {
        throw new Error('Not implemented');
    }

    _getRequireCompilers () {
        throw new Error('Not implemented');
    }

    _setupRequireHook (testFile) {
        var requireCompilers = this._getRequireCompilers();

        this.origRequireExtensions = Object.create(null);

        Object.keys(requireCompilers).forEach(ext => {
            var origExt = require.extensions[ext];

            this.origRequireExtensions[ext] = origExt;

            require.extensions[ext] = (mod, filename) => {
                // NOTE: remove global API so that it will be unavailable for the dependencies
                this._removeGlobalAPI();

                if (APIBasedTestFileCompilerBase._isNodeModulesDep(filename))
                    origExt(mod, filename);

                else {
                    var code         = readFileSync(filename).toString();
                    var compiledCode = requireCompilers[ext](stripBom(code), filename);

                    mod.paths = APIBasedTestFileCompilerBase._getNodeModulesLookupPath(filename);

                    mod._compile(compiledCode, filename);
                }

                this._addGlobalAPI(testFile);
            };
        });
    }

    _removeRequireHook () {
        Object.keys(this.origRequireExtensions).forEach(ext => {
            require.extensions[ext] = this.origRequireExtensions[ext];
        });
    }

    _compileCodeForTestFile (code, filename) {
        var compiledCode = null;

        stackCleaningHook.enabled = true;

        try {
            compiledCode = this._compileCode(code, filename);
        }
        catch (err) {
            throw new TestCompilationError(stackCleaningHook.cleanError(err));
        }
        finally {
            stackCleaningHook.enabled = false;
        }

        return compiledCode;
    }

    _addGlobalAPI (testFile) {
        Object.defineProperty(global, 'fixture', {
            get:          () => new Fixture(testFile),
            configurable: true
        });

        Object.defineProperty(global, 'test', {
            get:          () => new Test(testFile),
            configurable: true
        });
    }

    _removeGlobalAPI () {
        delete global.fixture;
        delete global.test;
    }

    compile (code, filename) {
        var compiledCode = this._compileCodeForTestFile(code, filename);
        var testFile     = new TestFile(filename);

        this._addGlobalAPI(testFile);

        stackCleaningHook.enabled = true;

        this._setupRequireHook(testFile);

        try {
            APIBasedTestFileCompilerBase._execAsModule(compiledCode, filename);
        }
        catch (err) {
            // HACK: workaround for the `instanceof` problem
            // (see: http://stackoverflow.com/questions/33870684/why-doesnt-instanceof-work-on-instances-of-error-subclasses-under-babel-node)
            if (err.constructor !== APIError)
                throw new TestCompilationError(stackCleaningHook.cleanError(err));

            throw err;
        }
        finally {
            this._removeRequireHook();
            stackCleaningHook.enabled = false;

            this._removeGlobalAPI();
        }

        return testFile.getTests();
    }

    _hasTests (code) {
        return FIXTURE_RE.test(code) && TEST_RE.test(code);
    }

    cleanUp () {
        this.cache = {};
    }
}
