import TestController from './test-controller';
import testRunTracker from './test-run-tracker';
import TestCafeErrorList from '../errors/error-list';

export default function wrapTestFunction (fn) {
    return async testRun => {
        var result     = null;
        var errList    = new TestCafeErrorList();
        var markeredfn = testRunTracker.addTrackingMarkerToFunction(testRun.id, fn);

        testRun.controller = new TestController(testRun);

        testRunTracker.ensureEnabled();

        try {
            result = await markeredfn(testRun.controller);
        }
        catch (err) {
            errList.addError(err);
        }

        if (errList.hasErrors)
            throw errList;

        // NOTE: check if the last command in the test
        // function is missing the `await` keyword.
        testRun.controller._checkForMissingAwait();

        return result;
    };
}
