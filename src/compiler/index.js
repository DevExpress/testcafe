import Promise from 'pinkie';
import { flattenDeep, find, chunk, uniq, groupBy } from 'lodash';
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

const testFileCompilers = {
    legacy:       new LegacyTestFileCompiler(hammerhead.processScript),
    esnext:       new EsNextTestFileCompiler(),
    typescript:   new TypeScriptTestFileCompiler(),
    coffeescript: new CoffeeScriptTestFileCompiler(),
    raw:          new RawTestFileCompiler()
};

export default class Compiler {
    constructor (sources) {
        this.sources = sources;
    }

    static getSupportedTestFileExtensions () {
        return uniq(Object.values(testFileCompilers).map(c => c.getSupportedExtension()));
    }

    async _createTestFileInfo (filename) {
        let code = null;

        try {
            code = await readFile(filename);
        }
        catch (err) {
            throw new GeneralError(RUNTIME_ERRORS.cannotFindSpecifiedTestSource, filename);
        }

        code = stripBom(code).toString();

        const compilerName = find(Object.keys(testFileCompilers), name => testFileCompilers[name].canCompile(code, filename));

        if (!compilerName)
            return null;

        return { compilerName, filename, code };
    }

    async _runCompilerForFiles (compilerName, testFilesInfo) {
        const compiler = testFileCompilers[compilerName];

        if (compiler.canCompileInBatch)
            return await compiler.compileBatch(testFilesInfo);

        return await Promise.all(testFilesInfo.map(({ code, filename }) => compiler.compile(code, filename)));
    }

    async _compileTestFiles (filenames) {
        const testFilesInfo = await Promise.all(filenames.map(filename => this._createTestFileInfo(filename)));
        const compilerTasks = groupBy(testFilesInfo.filter(info => !!info), 'compilerName');
        const compilerNames = Object.keys(compilerTasks);
        const compiledTests = await Promise.all(compilerNames.map(compilerName => this._runCompilerForFiles(compilerName, compilerTasks[compilerName])));

        return flattenDeep(compiledTests);
    }

    async getTests () {
        // NOTE: split sources into chunks because the fs module can't read all files
        // simultaneously if the number of them is too large (several thousands).
        const sourceChunks = chunk(this.sources, SOURCE_CHUNK_LENGTH);

        let tests = [];

        while (sourceChunks.length)
            tests = tests.concat(await this._compileTestFiles(sourceChunks.shift()));

        Compiler.cleanUp();

        return flattenDeep(tests).filter(test => !!test);
    }

    static cleanUp () {
        Object.values(testFileCompilers).forEach(c => c.cleanUp());
    }
}
