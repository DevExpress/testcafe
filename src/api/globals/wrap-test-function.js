import TestController from '../test-controller';
import getCallsite from '../../errors/get-callsite';
import { APIError } from '../../errors/runtime';
import hybridFnTestRunTracker from '../../hybrid-functions/test-run-tracker';

import {
    UncaughtErrorInTestCode,
    UncaughtNonErrorObjectInTestCode,
    ExternalAssertionLibraryError
} from '../../errors/test-run';


function processTestFnError (err) {
    if (err && err.isTestCafeError)
        return err;

    if (err && err.constructor === APIError)
        return new UncaughtErrorInTestCode(err.rawMessage, err.callsite);

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
        var markeredfn = hybridFnTestRunTracker.addTrackingMarkerToFunction(testRun.id, fn);

        hybridFnTestRunTracker.ensureEnabled();

        try {
            result = await markeredfn(controller);
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
