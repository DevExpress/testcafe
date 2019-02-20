import Promise from 'pinkie';
import { flattenDeep as flatten, find, chunk, uniq } from 'lodash';
import stripBom from 'strip-bom';
import { Compiler as LegacyTestFileCompiler } from 'testcafe-legacy-api';
import hammerhead from 'testcafe-hammerhead';
import EsNextTestFileCompiler from './test-file/formats/es-next/compiler';
import TypeScriptTestFileCompiler from './test-file/formats/typescript/compiler';
import CoffeeScriptTestFileCompiler from './test-file/formats/coffeescript/compiler';
import RawTestFileCompiler from './test-file/formats/raw';
import { readFile } from '../utils/promisified-functions';
import { GeneralError } from '../errors/runtime';
import { RUNTIME_ERRORS } from '../errors/types';


const SOURCE_CHUNK_LENGTH = 1000;

const testFileCompilers = [
    new LegacyTestFileCompiler(hammerhead.processScript),
    new EsNextTestFileCompiler(),
    new TypeScriptTestFileCompiler(),
    new CoffeeScriptTestFileCompiler(),
    new RawTestFileCompiler()
];

export default class Compiler {
    constructor (sources) {
        this.sources = sources;
    }

    static getSupportedTestFileExtensions () {
        return uniq(testFileCompilers.map(c => c.getSupportedExtension()));
    }

    async _compileTestFile (filename) {
        let code = null;

        try {
            code = await readFile(filename);
        }
        catch (err) {
            throw new GeneralError(RUNTIME_ERRORS.cantFindSpecifiedTestSource, filename);
        }

        code = stripBom(code).toString();

        const compiler = find(testFileCompilers, c => c.canCompile(code, filename));

        return compiler ? await compiler.compile(code, filename) : null;
    }

    async getTests () {
        const sourceChunks = chunk(this.sources, SOURCE_CHUNK_LENGTH);
        let tests        = [];
        let compileUnits = [];

        // NOTE: split sources into chunks because the fs module can't read all files
        // simultaneously if the number of them is too large (several thousands).
        while (sourceChunks.length) {
            compileUnits = sourceChunks.shift().map(filename => this._compileTestFile(filename));
            tests        = tests.concat(await Promise.all(compileUnits));
        }

        Compiler.cleanUp();

        tests = flatten(tests).filter(test => !!test);

        return tests;
    }

    static cleanUp () {
        testFileCompilers.forEach(c => c.cleanUp());
    }
}
