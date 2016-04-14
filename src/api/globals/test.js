import { GlobalsAPIError } from '../../errors/runtime';
import { UncaughtErrorInTestCode, UncaughtNonErrorObjectInTestCode } from '../../errors/test-run';
import getCallsite from '../../errors/get-callsite';
import MESSAGE from '../../errors/runtime/message';
import TestController from '../test-controller';

export default class Test {
    constructor (name, fn, fixture) {
        var nameType = typeof name;

        if (nameType !== 'string')
            throw new GlobalsAPIError('test', null, MESSAGE.testNameIsNotAString, nameType);

        var fnType = typeof fn;

        if (fnType !== 'function')
            throw new GlobalsAPIError('test', null, MESSAGE.testBodyIsNotAFunction, fnType);

        this.name    = name;
        this.fixture = fixture;
        this.fn      = Test._createTestFunction(fn);
    }

    static _processTestFnError (err) {
        if (err && err.isTestCafeError)
            return err;

        if (err instanceof Error)
            return new UncaughtErrorInTestCode(String(err), getCallsite(err));

        return new UncaughtNonErrorObjectInTestCode(err);
    }

    static _createTestFunction (fn) {
        return async testRun => {
            // NOTE: fn() result used for testing purposes
            var result     = null;
            var controller = new TestController(testRun);

            try {
                result = await fn(controller);
            }
            catch (err) {
                throw Test._processTestFnError(err);
            }

            // NOTE: check if the last command in the test
            // function is missing the `await` keyword.
            controller._checkForMissingAwait();

            return result;
        };
    }
}
