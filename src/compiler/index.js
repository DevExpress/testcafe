import * as fs from 'fs';
import Promise from 'pinkie';
import { flattenDeep as flatten, find } from 'lodash';
import stripBom from 'strip-bom';
import { Compiler as LegacyCompiler } from 'testcafe-legacy-api';
import hammerhead from 'testcafe-hammerhead';
import EsNextCompiler from './es-next';
import RawFileCompiler from './raw-file';
import { GeneralError } from '../errors/runtime';
import MESSAGE from '../errors/runtime/message';
import promisify from '../utils/promisify';

var readFile = promisify(fs.readFile);

export default class Compiler {
    constructor (sources) {
        this.sources         = sources;
        this.esNextCompiler  = new EsNextCompiler();
        this.rawDataCompiler = new RawFileCompiler();

        this.compilers = [
            new LegacyCompiler(hammerhead.processScript),
            this.esNextCompiler,
            this.rawDataCompiler
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
        var compileUnits = this.sources.map(filename => this._compileFile(filename));
        var tests        = await Promise.all(compileUnits);

        this.esNextCompiler.cleanUpCache();

        return flatten(tests).filter(test => !!test);
    }
}
