import hammerhead from 'testcafe-hammerhead';
import { Compiler as LegacyTestFileCompiler } from 'testcafe-legacy-api';
import EsNextTestFileCompiler from './test-file/formats/es-next/compiler';
import TypeScriptTestFileCompiler from './test-file/formats/typescript/compiler';
import CoffeeScriptTestFileCompiler from './test-file/formats/coffeescript/compiler';
import RawTestFileCompiler from './test-file/formats/raw';

function createTestFileCompilers (options) {
    return [
        new LegacyTestFileCompiler(hammerhead.processScript),
        new EsNextTestFileCompiler(),
        new TypeScriptTestFileCompiler(options),
        new CoffeeScriptTestFileCompiler(),
        new RawTestFileCompiler()
    ];
}

let testFileCompilers = [];

export function getTestFileCompilers () {
    if (!testFileCompilers.length)
        initTestFileCompilers();

    return testFileCompilers;
}

export function initTestFileCompilers (options = {}) {
    testFileCompilers = createTestFileCompilers(options);
}
