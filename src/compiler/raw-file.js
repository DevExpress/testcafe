import { GeneralError } from '../errors/runtime';
import MESSAGE from '../errors/runtime/message';
import processTestFnError from '../errors/process-test-fn-error';
import createCommandFromObject from '../test-run/commands/from-object';


export default class RawFileCompiler {
    canCompile (code, filename) {
        return /\.testcafe$/.test(filename);
    }

    static _createTestFn (commands) {
        return async testRun => {
            for (var i = 0; i < commands.length; i++) {
                var callsite = commands[i] && commands[i].callsite;
                var command  = null;

                try {
                    command = createCommandFromObject(commands[i]);
                    await testRun.executeCommand(command, callsite);
                }
                catch (err) {
                    err.callsite = callsite;
                    throw processTestFnError(err);
                }

            }
        };
    }

    static _compileTest (fixture, test) {
        test.fixture = fixture;
        test.fn      = RawFileCompiler._createTestFn(test.commands);

        if (test.beforeCommands)
            test.beforeFn = RawFileCompiler._createTestFn(test.beforeCommands);

        if (test.afterCommands)
            test.afterFn = RawFileCompiler._createTestFn(test.afterCommands);

        return test;
    }

    compile (code, filename) {
        var data = null;

        try {
            data = JSON.parse(code);
        }
        catch (err) {
            throw new GeneralError(MESSAGE.cannotParseRawFile, filename, err.toString());
        }

        var fixtures = data.fixtures;
        var tests    = [];

        fixtures.forEach(fixture => {
            fixture.path  = filename;
            fixture.tests = fixture.tests.map(test => RawFileCompiler._compileTest(fixture, test));
            tests         = tests.concat(fixture.tests);

            if (fixture.beforeEachCommands)
                fixture.beforeEachFn = RawFileCompiler._createTestFn(fixture.beforeEachCommands);

            if (fixture.afterEachCommands)
                fixture.afterEachFn = RawFileCompiler._createTestFn(fixture.afterEachCommands);
        });

        return tests;
    }
}
