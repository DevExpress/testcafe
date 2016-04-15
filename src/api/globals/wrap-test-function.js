import TestController from '../test-controller';
import getCallsite from '../../errors/get-callsite';
import {
    UncaughtErrorInTestCode,
    UncaughtNonErrorObjectInTestCode,
    ExternalAssertionLibraryError
} from '../../errors/test-run';

function processTestFnError (err) {
    if (err && err.isTestCafeError)
        return err;

    if (err instanceof Error) {
        var callsite         = getCallsite(err);
        var isAssertionError = err.name === 'AssertionError' || err.constructor.name === 'AssertionError';

        return isAssertionError ?
               new ExternalAssertionLibraryError(err, callsite) :
               new UncaughtErrorInTestCode(err, callsite);
    }

    return new UncaughtNonErrorObjectInTestCode(err);
}

export default function wrapTestFunction (fn) {
    return async testRun => {
        // NOTE: fn() result used for testing purposes
        var result     = null;
        var controller = new TestController(testRun);

        try {
            result = await fn(controller);
        }
        catch (err) {
            throw processTestFnError(err);
        }

        // NOTE: check if the last command in the test
        // function is missing the `await` keyword.
        controller._checkForMissingAwait();

        return result;
    };
}
