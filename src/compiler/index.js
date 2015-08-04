import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';
import { resolve as resolveUrl } from 'url';
import Promise from 'promise';
import { Compiler as OldCompiler } from './old';
import OS from '../utils/os';

var readFile = Promise.denodeify(fs.readFile);

function exists (filePath) {
    return new Promise(resolve => fs.exists(filePath, resolve));
}

export default class Compiler {
    constructor (sources) {
        this.sources = sources;

        this.cache = {
            requires:     {},
            requireJsMap: {},
            sourceIndex:  [],
            configs:      {}
        };
    }

    static _resolveConfigModules (cfg, dirName) {
        if (cfg.modules) {
            Object.keys(cfg.modules).forEach(name => {
                var mod = cfg.modules[name];

                if (Array.isArray(mod))
                    mod = mod.map(filePath => path.resolve(dirName, filePath));
                else
                    mod = path.resolve(dirName, mod);

                cfg.modules[name] = mod;
            });
        }
    }

    static async _collectDirConfigs (dirName) {
        var cfgs = [];

        var dirHierarchy = dirName
            .split(path.sep)
            .reduce((dirs, chunk) => {
                var dir = null;

                if (dirs.length)
                    dir = path.join(dirs[dirs.length - 1], chunk);
                else if (OS.win)
                    dir = chunk;
                else
                    dir = path.sep + chunk;

                dirs.push(dir);

                return dirs;
            }, []);

        for (var dir of dirHierarchy) {
            var cfgPath  = path.join(dir, 'test_config.json');
            var isExists = await exists(cfgPath);

            if (isExists) {
                var data = await readFile(cfgPath);
                var cfg  = JSON.parse(data);

                Compiler._resolveConfigModules(cfg, dir);
                cfgs.push(cfg);
            }
        }

        return cfgs;
    }

    async getTests () {
        var fixtures = await * this.sources.map(filePath => this._compileFile(filePath));

        return fixtures.reduce((tests, fixture) => tests.concat(fixture.tests), []);
    }

    async _getConfig (filePath) {
        var dirName   = path.dirname(filePath);
        var cfg       = {};
        var cachedCfg = this.cache.configs[dirName];

        if (cachedCfg)
            cfg = cachedCfg;
        else {
            // NOTE: walk up in the directories hierarchy and collect test_config.json files
            var dirConfigs = await Compiler._collectDirConfigs(dirName);

            cfg = {
                modules: {},
                baseUrl: ''
            };

            dirConfigs.forEach(dirCfg => {
                if (dirCfg.modules) {
                    Object.keys(dirCfg.modules).forEach(name => {
                        cfg.modules[name] = dirCfg.modules[name];
                    });
                }

                if (dirCfg.baseUrl)
                    cfg.baseUrl = resolveUrl(cfg.baseUrl, dirCfg.baseUrl);
            });

            this.cache.configs[dirName] = cfg;
        }

        return cfg;
    }

    _createOldCompilerPromise (filePath, modules) {
        return new Promise((resolve, reject)=> {
            var oldCompiler = new OldCompiler(filePath, modules, this.cache.requires, this.cache.sourceIndex);

            oldCompiler.compile((errs, out)=> {
                if (errs)
                    reject(errs);
                else
                    resolve(out);
            });
        });
    }

    _createFixture (compiled, filePath, baseUrl, requireJsMapKey, remainderJs) {
        var fixture = {
            name:            compiled.fixture,
            path:            filePath,
            page:            resolveUrl(baseUrl, compiled.page),
            authCredentials: compiled.authCredentials,
            tests:           null,
            getSharedJs:     () => this.cache.requireJsMap[requireJsMapKey] + remainderJs
        };

        fixture.tests = Object.keys(compiled.testsStepData).map(testName => ({
            name:        testName,
            sourceIndex: this.cache.sourceIndex,
            stepData:    compiled.testsStepData[testName],
            fixture:     fixture
        }));

        return fixture;
    }


    async _compileFile (filePath) {
        var { modules, baseUrl } = await this._getConfig(filePath);

        var compiled = await this._createOldCompilerPromise(filePath, modules);

        //NOTE: solve memory overuse issue by storing requireJs in the suite-level hash-based map
        //(see: B237609 - Fixture file compiler memory overuse)
        var hash         = createHash('md5');
        var requireJsMap = this.cache.requireJsMap;
        var remainderJs  = compiled.remainderJs;

        hash.update(compiled.requireJs);

        var requireJsMapKey = hash.digest('hex');

        if (!requireJsMap[requireJsMapKey])
            requireJsMap[requireJsMapKey] = compiled.requireJs;

        return this._createFixture(compiled, filePath, baseUrl, requireJsMapKey, remainderJs);
    }
}
