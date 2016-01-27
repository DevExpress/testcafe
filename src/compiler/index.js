import * as fs from 'fs';
import flatten from 'flatten';
import stripBom from 'strip-bom';
import find from 'array-find';
import { Compiler as LegacyCompiler } from 'testcafe-legacy-api';
import { wrapDomAccessors } from 'testcafe-hammerhead';
import EsNextCompiler from './es-next';
import promisify from '../utils/promisify';

var readFile = promisify(fs.readFile);

export default class Compiler {
    constructor (sources) {
        this.sources        = sources;
        this.esNextCompiler = new EsNextCompiler();

        this.compilers = [
            new LegacyCompiler(wrapDomAccessors),
            this.esNextCompiler
        ];
    }

    async _compileFile (filename) {
        var code = await readFile(filename);

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
