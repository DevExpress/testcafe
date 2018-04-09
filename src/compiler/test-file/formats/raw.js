import TestFileCompilerBase from '../base';
import { GeneralError } from '../../../errors/runtime';
import MESSAGE from '../../../errors/runtime/message';
import TestFile from '../../../api/structure/test-file';
import Fixture from '../../../api/structure/fixture';
import Test from '../../../api/structure/test';
import createCommandFromObject from '../../../test-run/commands/from-object';

export default class RawTestFileCompiler extends TestFileCompilerBase {
    static _createTestFn (commands) {
        return async t => {
            for (var i = 0; i < commands.length; i++) {
                var callsite = commands[i] && commands[i].callsite;
                var command  = null;

                try {
                    command = createCommandFromObject(commands[i]);
                    await t.testRun.executeCommand(command, callsite);
                }
                catch (err) {
                    err.callsite = callsite;
                    throw err;
                }
            }
        };
    }

    static _assignCommonTestingUnitProperties (src, dest) {
        if (src.pageUrl)
            dest.page(src.pageUrl);

        if (src.authCredentials)
            dest.httpAuth(src.authCredentials);

        /* eslint-disable no-unused-expressions */
        if (src.only)
            dest.only;

        if (src.skip)
            dest.skip;
        /* eslint-enable no-unused-expressions */
    }

    static _addTest (testFile, src) {
        var test = new Test(testFile);

        test(src.name, RawTestFileCompiler._createTestFn(src.commands));

        RawTestFileCompiler._assignCommonTestingUnitProperties(src, test);

        if (src.beforeCommands)
            test.before(RawTestFileCompiler._createTestFn(src.beforeCommands));

        if (src.afterCommands)
            test.after(RawTestFileCompiler._createTestFn(src.afterCommands));

        return test;
    }

    static _addFixture (testFile, src) {
        var fixture = new Fixture(testFile);

        fixture(src.name);

        RawTestFileCompiler._assignCommonTestingUnitProperties(src, fixture);

        if (src.beforeEachCommands)
            fixture.beforeEach(RawTestFileCompiler._createTestFn(src.beforeEachCommands));

        if (src.afterEachCommands)
            fixture.afterEach(RawTestFileCompiler._createTestFn(src.afterEachCommands));

        src.tests.forEach(testSrc => RawTestFileCompiler._addTest(testFile, testSrc));
    }

    _hasTests () {
        return true;
    }

    getSupportedExtension () {
        return '.testcafe';
    }

    compile (code, filename) {
        var data     = null;
        var testFile = new TestFile(filename);

        try {
            data = JSON.parse(code);

            data.fixtures.forEach(fixtureSrc => RawTestFileCompiler._addFixture(testFile, fixtureSrc));

            return testFile.getTests();
        }
        catch (err) {
            throw new GeneralError(MESSAGE.cannotParseRawFile, filename, err.toString());
        }
    }
}
