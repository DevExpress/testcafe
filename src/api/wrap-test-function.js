import TestController from './test-controller';
import testRunTracker from './test-run-tracker';
import processTestFnError from '../errors/process-test-fn-error';

export default function wrapTestFunction (fn) {
    return async testRun => {
        var result     = null;
        var markeredfn = testRunTracker.addTrackingMarkerToFunction(testRun.id, fn);

        testRun.controller = new TestController(testRun);

        testRunTracker.ensureEnabled();

        try {
            result = await markeredfn(testRun.controller);
        }
        catch (err) {
            throw processTestFnError(err);
        }

        // NOTE: check if the last command in the test
        // function is missing the `await` keyword.
        testRun.controller._checkForMissingAwait();

        return result;
    };
}
