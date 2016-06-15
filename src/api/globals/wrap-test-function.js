import TestController from '../test-controller';
import clientFnTestRunTracker from '../../client-functions/test-run-tracker';
import processTestFnError from '../../errors/process-test-fn-error';

export default function wrapTestFunction (fn) {
    return async testRun => {
        // NOTE: fn() result used for testing purposes
        var result     = null;
        var controller = new TestController(testRun);
        var markeredfn = clientFnTestRunTracker.addTrackingMarkerToFunction(testRun.id, fn);

        clientFnTestRunTracker.ensureEnabled();

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
