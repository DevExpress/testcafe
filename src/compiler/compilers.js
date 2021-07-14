import hammerhead from 'testcafe-hammerhead';
import { Compiler as LegacyTestFileCompiler } from 'testcafe-legacy-api';
import EsNextTestFileCompiler from './test-file/formats/es-next/compiler';
import TypeScriptTestFileCompiler from './test-file/formats/typescript/compiler';
import CoffeeScriptTestFileCompiler from './test-file/formats/coffeescript/compiler';
import RawTestFileCompiler from './test-file/formats/raw';
import CustomizableCompilers from '../configuration/customizable-compilers';

function createTestFileCompilers (options = {}, isExternalServiceMode) {
    return [
        new LegacyTestFileCompiler(hammerhead.processScript),
        new EsNextTestFileCompiler(isExternalServiceMode),
        new TypeScriptTestFileCompiler(options[CustomizableCompilers.typescript], isExternalServiceMode),
        new CoffeeScriptTestFileCompiler(),
        new RawTestFileCompiler(),
    ];
}

let testFileCompilers = [];

export function getTestFileCompilers () {
    if (!testFileCompilers.length)
        initTestFileCompilers();

    return testFileCompilers;
}

export function initTestFileCompilers (options, isExternalServiceMode) {
    testFileCompilers = createTestFileCompilers(options, isExternalServiceMode);
}
