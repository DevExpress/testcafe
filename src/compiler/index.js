import * as fs from 'fs';
import Promise from 'pinkie';
import { flattenDeep as flatten, find, chunk } from 'lodash';
import stripBom from 'strip-bom';
import sourceMapSupport from 'source-map-support';
import { Compiler as LegacyTestFileCompiler } from 'testcafe-legacy-api';
import hammerhead from 'testcafe-hammerhead';
import EsNextTestFileCompiler from './test-file/formats/es-next';
import TypeScriptTestFileCompiler from './test-file/formats/typescript';
import RawTestFileCompiler from './test-file/formats/raw';
import { GeneralError } from '../errors/runtime';
import MESSAGE from '../errors/runtime/message';
import promisify from '../utils/promisify';

var readFile = promisify(fs.readFile);

const SOURCE_CHUNK_LENGTH = 1000;

export default class Compiler {
    constructor (sources) {
        this.sources = sources;

        this.testFileCompilers = [
            new LegacyTestFileCompiler(hammerhead.processScript),
            new EsNextTestFileCompiler(),
            new TypeScriptTestFileCompiler(),
            new RawTestFileCompiler()
        ];

        Compiler._setupSourceMapsSupport();
    }

    static _setupSourceMapsSupport () {
        sourceMapSupport.install({
            hookRequire:              true,
            handleUncaughtExceptions: false,
            environment:              'node'
        });
    }

    async _compileTestFile (filename) {
        var code = null;

        try {
            code = await readFile(filename);
        }
        catch (err) {
            throw new GeneralError(MESSAGE.cantFindSpecifiedTestSource, filename);
        }

        code = stripBom(code).toString();

        var compiler = find(this.testFileCompilers, c => c.canCompile(code, filename));

        return compiler ? await compiler.compile(code, filename) : null;
    }

    async getTests () {
        var sourceChunks = chunk(this.sources, SOURCE_CHUNK_LENGTH);
        var tests        = [];
        var compileUnits = [];

        // NOTE: split sources into chunks because the fs module can't read all files
        // simultaneously if the number of them is too large (several thousands).
        while (sourceChunks.length) {
            compileUnits = sourceChunks.shift().map(filename => this._compileTestFile(filename));
            tests        = tests.concat(await Promise.all(compileUnits));
        }

        this.testFileCompilers.forEach(c => c.cleanUp());

        tests = flatten(tests).filter(test => !!test);

        return tests;
    }
}
