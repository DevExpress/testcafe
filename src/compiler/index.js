import Promise from 'pinkie';
import { flattenDeep as flatten, find, chunk, uniq } from 'lodash';
import stripBom from 'strip-bom';
import sourceMapSupport from 'source-map-support';
import { Compiler as LegacyTestFileCompiler } from 'testcafe-legacy-api';
import hammerhead from 'testcafe-hammerhead';
import EsNextTestFileCompiler from './test-file/formats/es-next/compiler';
import TypeScriptTestFileCompiler from './test-file/formats/typescript/compiler';
import RawTestFileCompiler from './test-file/formats/raw';
import { readFile } from '../utils/promisified-functions';
import { GeneralError } from '../errors/runtime';
import MESSAGE from '../errors/runtime/message';


const SOURCE_CHUNK_LENGTH = 1000;

var testFileCompilers = [
    new LegacyTestFileCompiler(hammerhead.processScript),
    new EsNextTestFileCompiler(),
    new TypeScriptTestFileCompiler(),
    new RawTestFileCompiler()
];

export default class Compiler {
    constructor (sources) {
        this.sources = sources;

        Compiler._setupSourceMapsSupport();
    }

    static getSupportedTestFileExtensions () {
        return uniq(testFileCompilers.map(c => c.getSupportedExtension()));
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

        var compiler = find(testFileCompilers, c => c.canCompile(code, filename));

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

        testFileCompilers.forEach(c => c.cleanUp());

        tests = flatten(tests).filter(test => !!test);

        return tests;
    }
}
