import TestController from './test-controller';
import testRunTracker from './test-run-tracker';
import TestCafeErrorList from '../errors/error-list';
import { MissingAwaitError } from '../errors/test-run';


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

        testRun.controller.callsitesWithoutAwait.forEach(callsite => {
            errList.addError(new MissingAwaitError(callsite));
        });

        if (errList.hasErrors)
            throw errList;

        return result;
    };
}
