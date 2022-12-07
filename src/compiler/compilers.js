import hammerhead from 'testcafe-hammerhead';
import { Compiler as LegacyTestFileCompiler } from 'testcafe-legacy-api';
import EsNextTestFileCompiler from './test-file/formats/es-next/compiler';
import TypeScriptTestFileCompiler from './test-file/formats/typescript/compiler';
import CoffeeScriptTestFileCompiler from './test-file/formats/coffeescript/compiler';
import RawTestFileCompiler from './test-file/formats/raw/compiler';
import DevToolsTestFileCompiler from './test-file/formats/dev-tools/compiler';
import CustomizableCompilers from '../configuration/customizable-compilers';

function createTestFileCompilers (compilerOptions = {}, { isCompilerServiceMode, baseUrl, experimentalEsm } = {}) {
    return [
        new LegacyTestFileCompiler(hammerhead.processScript),
        new EsNextTestFileCompiler({ isCompilerServiceMode, baseUrl, experimentalEsm }),
        new TypeScriptTestFileCompiler(compilerOptions[CustomizableCompilers.typescript], { isCompilerServiceMode, baseUrl, experimentalEsm }),
        new CoffeeScriptTestFileCompiler({ baseUrl, experimentalEsm }),
        new RawTestFileCompiler({ baseUrl }),
        new DevToolsTestFileCompiler({ baseUrl }),
    ];
}

let testFileCompilers = [];

export function getTestFileCompilers () {
    if (!testFileCompilers.length)
        initTestFileCompilers();

    return testFileCompilers;
}

export function initTestFileCompilers (compilerOptions, { isCompilerServiceMode, baseUrl, experimentalEsm } = {}) {
    testFileCompilers = createTestFileCompilers(compilerOptions, { isCompilerServiceMode, baseUrl, experimentalEsm });
}
