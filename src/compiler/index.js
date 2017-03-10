import * as fs from 'fs';
import Promise from 'pinkie';
import { flattenDeep as flatten, find, chunk } from 'lodash';
import stripBom from 'strip-bom';
import { Compiler as LegacyCompiler } from 'testcafe-legacy-api';
import hammerhead from 'testcafe-hammerhead';
import EsNextCompiler from './es-next';
import RawFileCompiler from './raw-file';
import { GeneralError } from '../errors/runtime';
import MESSAGE from '../errors/runtime/message';
import promisify from '../utils/promisify';

var readFile = promisify(fs.readFile);

const SOURCE_CHUNK_LENGTH      = 1000;

export default class Compiler {
    constructor (sources) {
        this.sources         = sources;
        this.esNextCompiler  = new EsNextCompiler();

        this.compilers = [
            new LegacyCompiler(hammerhead.processScript),
            this.esNextCompiler,
            new RawFileCompiler()
        ];
    }

    async _compileFile (filename) {
        var code = null;

        try {
            code = await readFile(filename);
        }
        catch (err) {
            throw new GeneralError(MESSAGE.cantFindSpecifiedTestSource, filename);
        }

        code = stripBom(code).toString();

        var compiler = find(this.compilers, c => c.canCompile(code, filename));

        return compiler ? compiler.compile(code, filename) : null;
    }

    async getTests () {
        var sourceChunks = chunk(this.sources, SOURCE_CHUNK_LENGTH);
        var tests        = [];
        var compileUnits = [];

        // NOTE: split sources into chunks because the fs module can't read all files
        // simultaneously if the number of them is too large (several thousands).
        while (sourceChunks.length) {
            compileUnits = sourceChunks.shift().map(filename => this._compileFile(filename));
            tests        = tests.concat(await Promise.all(compileUnits));
        }

        this.esNextCompiler.cleanUpCache();

        tests = flatten(tests).filter(test => !!test);

        return tests;
    }
}
