import { GeneralError } from '../errors/runtime';
import MESSAGE from '../errors/runtime/message';
import TestFile from '../api/structure/test-file';
import Fixture from '../api/structure/fixture';
import Test from '../api/structure/test';
import createCommandFromObject from '../test-run/commands/from-object';


export default class RawFileCompiler {
    canCompile (code, filename) {
        return /\.testcafe$/.test(filename);
    }

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

        test(src.name, RawFileCompiler._createTestFn(src.commands));

        RawFileCompiler._assignCommonTestingUnitProperties(src, test);

        if (src.beforeCommands)
            test.before(RawFileCompiler._createTestFn(src.beforeCommands));

        if (src.afterCommands)
            test.after(RawFileCompiler._createTestFn(src.afterCommands));

        return test;
    }

    static _addFixture (testFile, src) {
        var fixture = new Fixture(testFile);

        fixture(src.name);

        RawFileCompiler._assignCommonTestingUnitProperties(src, fixture);

        if (src.beforeEachCommands)
            fixture.beforeEach(RawFileCompiler._createTestFn(src.beforeEachCommands));

        if (src.afterEachCommands)
            fixture.afterEach(RawFileCompiler._createTestFn(src.afterEachCommands));

        src.tests.forEach(testSrc => RawFileCompiler._addTest(testFile, testSrc));
    }

    compile (code, filename) {
        var data     = null;
        var testFile = new TestFile(filename);

        try {
            data = JSON.parse(code);

            data.fixtures.forEach(fixtureSrc => RawFileCompiler._addFixture(testFile, fixtureSrc));
        }
        catch (err) {
            throw new GeneralError(MESSAGE.cannotParseRawFile, filename, err.toString());
        }

        return testFile.getTests();
    }
}
