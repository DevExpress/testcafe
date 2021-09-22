import TestFile from '../../api/structure/test-file';
import Fixture from '../../api/structure/fixture';
import Test from '../../api/structure/test';


export default function (testFile: TestFile, exportableLibExports: any, isCompilerServiceMode = false): void {
    Object.defineProperty(exportableLibExports, 'fixture', {
        get:          () => new Fixture(testFile),
        configurable: true,
    });

    Object.defineProperty(exportableLibExports, 'test', {
        get: () => {
            // NOTE: After wrapping the "import { test } from 'testcafe'" statement
            // in service functions of the 'esm' module
            // the 'test' directive executed a few times before the 'fixture' directive.
            // We need to pass an additional flag to ensure correct 'Test' function loading.
            return new Test(testFile, isCompilerServiceMode);
        },
        configurable: true,
    });
}
