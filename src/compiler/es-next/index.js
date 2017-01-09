import { dirname, join, relative, sep as pathSep } from 'path';
import { readFileSync } from 'fs';
import stripBom from 'strip-bom';
import sourceMapSupport from 'source-map-support';
import loadBabelLibs from './load-babel-libs';
import NODE_VER from '../../utils/node-version';
import Globals from '../../api/globals';
import { TestCompilationError, APIError } from '../../errors/runtime';
import stackCleaningHook from '../../errors/stack-cleaning-hook';

const COMMON_API_PATH = join(__dirname, '../../api/common');
const CWD             = process.cwd();

const FIXTURE_RE       = /(^|;|\s+)fixture\s*(\.|\(|`)/;
const TEST_RE          = /(^|;|\s+)test\s*(\.|\()/;
const BABEL_RUNTIME_RE = /^babel-runtime(\\|\/|$)/;

var Module = module.constructor;

export default class ESNextCompiler {
    constructor () {
        this.sourceMaps = {};
        this.cache      = {};

        this._setupSourceMapsSupport();
    }

    static _getNodeModulesLookupPath (filename) {
        var dir = dirname(filename);

        return Module._nodeModulePaths(dir);
    }

    static _getBabelOptions (filename) {
        var { presetStage2, transformRuntime, presetES2015Loose, presetES2015Node4 } = loadBabelLibs();

        var presetES2015 = NODE_VER < 4 ? presetES2015Loose : presetES2015Node4;

        // NOTE: passPrePreset and complex presets is a workaround for https://github.com/babel/babel/issues/2877
        // Fixes https://github.com/DevExpress/testcafe/issues/969
        return {
            passPerPreset: true,
            presets:       [
                { plugins: transformRuntime },
                {
                    passPerPreset: false,
                    presets:       [presetStage2, presetES2015]
                }
            ],
            filename:      filename,
            sourceMaps:    true,
            retainLines:   true,
            ast:           false,
            babelrc:       false,
            highlightCode: false,

            resolveModuleSource: source => {
                if (source === 'testcafe')
                    return COMMON_API_PATH;

                if (BABEL_RUNTIME_RE.test(source)) {
                    try {
                        return require.resolve(source);
                    }
                    catch (err) {
                        return source;
                    }
                }

                return source;
            }
        };
    }

    static _isNodeModulesDep (filename) {
        return relative(CWD, filename)
            .split(pathSep)
            .indexOf('node_modules') >= 0;
    }

    static _execAsModule (code, filename) {
        var mod = new Module(filename, module.parent);

        mod.filename = filename;
        mod.paths    = ESNextCompiler._getNodeModulesLookupPath(filename);

        mod._compile(code, filename);
    }

    _setupSourceMapsSupport () {
        sourceMapSupport.install({
            handleUncaughtExceptions: false,
            environment:              'node',

            retrieveSourceMap: filename => {
                var map = this.sourceMaps[filename];

                return map ? { url: filename, map } : null;
            }
        });
    }

    _compileES (code, filename) {
        var { babel } = loadBabelLibs();

        if (this.cache[filename])
            return this.cache[filename];

        var opts     = ESNextCompiler._getBabelOptions(filename);
        var compiled = babel.transform(code, opts);

        this.cache[filename]      = compiled.code;
        this.sourceMaps[filename] = compiled.map;

        return compiled.code;
    }

    _setupRequireHook (globals) {
        var origRequireExtension = require.extensions['.js'];

        require.extensions['.js'] = (mod, filename) => {
            // NOTE: remove global API so that it will be unavailable for the dependencies
            globals.remove();

            if (ESNextCompiler._isNodeModulesDep(filename))
                origRequireExtension(mod, filename);
            else {
                var code         = readFileSync(filename);
                var compiledCode = this._compileES(stripBom(code), filename);

                mod.paths = ESNextCompiler._getNodeModulesLookupPath(filename);

                mod._compile(compiledCode, filename);
            }

            globals.setup();
        };

        return origRequireExtension;
    }

    _compileESForTestFile (code, filename) {
        var compiledCode = null;

        stackCleaningHook.enabled = true;

        try {
            compiledCode = this._compileES(code, filename);
        }
        catch (err) {
            throw new TestCompilationError(err);
        }
        finally {
            stackCleaningHook.enabled = false;
        }

        return compiledCode;
    }

    canCompile (code, filename) {
        return /\.js$/.test(filename) &&
               FIXTURE_RE.test(code) &&
               TEST_RE.test(code);
    }

    compile (code, filename) {
        var compiledCode = this._compileESForTestFile(code, filename);
        var globals      = new Globals(filename);

        globals.setup();

        stackCleaningHook.enabled = true;

        var origRequireExtension = this._setupRequireHook(globals);

        try {
            ESNextCompiler._execAsModule(compiledCode, filename);
        }
        catch (err) {
            // HACK: workaround for the `instanceof` problem
            // (see: http://stackoverflow.com/questions/33870684/why-doesnt-instanceof-work-on-instances-of-error-subclasses-under-babel-node)
            if (err.constructor !== APIError)
                throw new TestCompilationError(err);

            throw err;
        }
        finally {
            require.extensions['.js'] = origRequireExtension;
            stackCleaningHook.enabled = false;

            globals.remove();
        }

        return globals.collectedTests;
    }

    cleanUpCache () {
        this.cache = null;
    }
}
