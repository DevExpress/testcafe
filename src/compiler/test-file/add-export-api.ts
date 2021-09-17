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
            return new Test(testFile, isCompilerServiceMode);
        },
        configurable: true,
    });
}
