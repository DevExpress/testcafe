import hammerhead from 'testcafe-hammerhead';
import { Compiler as LegacyTestFileCompiler } from 'testcafe-legacy-api';
import EsNextTestFileCompiler from './test-file/formats/es-next/compiler';
import TypeScriptTestFileCompiler from './test-file/formats/typescript/compiler';
import CoffeeScriptTestFileCompiler from './test-file/formats/coffeescript/compiler';
import RawTestFileCompiler from './test-file/formats/raw/compiler';
import DevToolsTestFileCompiler from './test-file/formats/dev-tools/compiler';
import CustomizableCompilers from '../configuration/customizable-compilers';

function createTestFileCompilers (compilerOptions = {}, { baseUrl, esm } = {}) {
    return [
        new LegacyTestFileCompiler(hammerhead.processScript),
        new EsNextTestFileCompiler({ baseUrl, esm }),
        new TypeScriptTestFileCompiler(compilerOptions[CustomizableCompilers.typescript], { baseUrl, esm }),
        new CoffeeScriptTestFileCompiler({ baseUrl, esm }),
        new RawTestFileCompiler({ baseUrl }),
        new DevToolsTestFileCompiler({ baseUrl }),
    ];
}

let testFileCompilers = [];

export function getTestFileCompilers (esm) {
    if (!testFileCompilers.length)
        initTestFileCompilers({}, { baseUrl: '', esm });

    return testFileCompilers;
}

export function initTestFileCompilers (compilerOptions, { baseUrl, esm } = {}) {
    testFileCompilers = createTestFileCompilers(compilerOptions, { baseUrl, esm });
}
