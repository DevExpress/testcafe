import { GlobalsAPIError } from '../../errors/runtime';
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

    static _createTestFunction (fn) {
        return async testRun => {
            // NOTE: fn() result used for testing purposes
            var controller = new TestController(testRun);
            var result     = await fn(controller);

            // NOTE: check if the last command in the test
            // function is missing the `await` keyword.
            controller._checkForMissingAwait();

            return result;
        };
    }
}
