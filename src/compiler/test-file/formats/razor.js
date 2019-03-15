import { parse as parsePath } from 'path';
import promisifyEvent from 'promisify-event';
import TestFileCompilerBase from '../base';
import { GeneralError } from '../../../errors/runtime';
import { RUNTIME_ERRORS } from '../../../errors/types';
import { ExternalAssertionLibraryError } from '../../../errors/test-run'
import TestFile from '../../../api/structure/test-file';
import Fixture from '../../../api/structure/fixture';
import Test from '../../../api/structure/test';

import { ClientFunction, Selector } from '../../../api/exportable-lib';

export default class RazorTestFileCompiler extends TestFileCompilerBase {
    static _createTestFn () {
        return async t => {
            let finished = false;

            global.t = t;

            global.Selector = Selector;
            global.ClientFunction = ClientFunction;

            t.end = () => { finished = true; };

            t.assertionError = msg => { throw new ExternalAssertionLibraryError(msg, null) };

            while (!finished) {
                let command = await promisifyEvent(process.stdin, 'data');

                if (!command)
                    continue;

                command = command.toString().trim();

                if (!command)
                    continue;

                try {
                    await eval(command);
                } catch (e) {
                    console.log('\nerror\n');

                    if (e.isTestCafeError)
                        e.callsite = null;
                    
                    throw e;
                }

                console.log('\nok\n');
            }
        };
    }

    static _addTest (testFile, fixtureName) {
        const test = new Test(testFile);

        test(fixtureName + ' test', RazorTestFileCompiler._createTestFn());

        return test;
    }

    static _addFixture (testFile) {
        const fixtureName = parsePath(testFile.filename).name; 
        const fixture     = new Fixture(testFile);

        fixture(fixtureName);

        fixture.page(`http://localhost:5000/${fixtureName}`);

        RazorTestFileCompiler._addTest(testFile, fixtureName);
    }

    _hasTests () {
        return true;
    }

    getSupportedExtension () {
        return '.cshtml';
    }

    compile (code, filename) {
        const testFile = new TestFile(filename);

        try {
            RazorTestFileCompiler._addFixture(testFile);

            return testFile.getTests();
        }
        catch (err) {
            throw new GeneralError(RUNTIME_ERRORS.cannotParseRawFile, filename, err.toString());
        }
    }
}
