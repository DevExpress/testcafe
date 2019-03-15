import Promise from 'pinkie';
import { flattenDeep, find, chunk, uniq } from 'lodash';
import stripBom from 'strip-bom';
import { Compiler as LegacyTestFileCompiler } from 'testcafe-legacy-api';
import hammerhead from 'testcafe-hammerhead';
import EsNextTestFileCompiler from './test-file/formats/es-next/compiler';
import TypeScriptTestFileCompiler from './test-file/formats/typescript/compiler';
import CoffeeScriptTestFileCompiler from './test-file/formats/coffeescript/compiler';
import RawTestFileCompiler from './test-file/formats/raw';
import RazorTestFileCompiler from './test-file/formats/razor';
import { readFile } from '../utils/promisified-functions';
import { GeneralError } from '../errors/runtime';
import { RUNTIME_ERRORS } from '../errors/types';


const SOURCE_CHUNK_LENGTH = 1000;

const testFileCompilers = [
    new LegacyTestFileCompiler(hammerhead.processScript),
    new EsNextTestFileCompiler(),
    new TypeScriptTestFileCompiler(),
    new CoffeeScriptTestFileCompiler(),
    new RawTestFileCompiler(),
    new RazorTestFileCompiler()
];

export default class Compiler {
    constructor (sources) {
        this.sources = sources;
    }

    static getSupportedTestFileExtensions () {
        return uniq(testFileCompilers.map(compiler => compiler.getSupportedExtension()));
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

        const compiler = find(testFileCompilers, someCompiler => someCompiler.canCompile(code, filename));

        if (!compiler)
            return null;

        return {
            filename,
            code,
            compiler,

            compiledCode: null
        };
    }

    async _createTestFilesInfo (filenames) {
        const testFilesInfo = await Promise.all(filenames.map(filename => this._createTestFileInfo(filename)));

        return testFilesInfo.filter(info => !!info);
    }

    async _precompileFiles (compiler, testFilesInfo) {
        if (!compiler.canPrecompile)
            return;

        const precompiledCode = await compiler.precompile(testFilesInfo);

        for (let i = 0; i < testFilesInfo.length; i++)
            testFilesInfo[i].compiledCode = precompiledCode[i];
    }

    _getCompilerTasks (testFilesInfo) {
        const tasks     = new WeakMap();
        const compilers = [];

        for (const info of testFilesInfo) {
            const { compiler } = info;

            if (!tasks.has(compiler)) {
                compilers.push(compiler);
                tasks.set(compiler, []);
            }

            tasks.get(info.compiler).push(info);
        }

        return compilers.map(compiler => ({ compiler, compilerTestFilesInfo: tasks.get(compiler) }));
    }

    async _getTests ({ compiler, filename, code, compiledCode }) {
        if (compiledCode)
            return await compiler.execute(compiledCode, filename);

        return await compiler.compile(code, filename);
    }

    async _compileTestFiles (filenames) {
        const testFilesInfo = await this._createTestFilesInfo(filenames);
        const compilerTasks = this._getCompilerTasks(testFilesInfo);

        await Promise.all(compilerTasks.map(({ compiler, compilerTestFilesInfo }) => this._precompileFiles(compiler, compilerTestFilesInfo)));

        const tests = [];

        for (const info of testFilesInfo)
            tests.push(await this._getTests(info));

        return tests;
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
        testFileCompilers.forEach(compiler => compiler.cleanUp());
    }
}
