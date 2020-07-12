import TestController from './test-controller';
import testRunTracker from './test-run-tracker';
import TestCafeErrorList from '../errors/error-list';
import { MissingAwaitError } from '../errors/test-run';
import * as globalCallsites from '../utils/global-callsites';

export default function wrapTestFunction (fn) {
    return async testRun => {
        let result       = null;
        const errList    = new TestCafeErrorList();
        const markeredfn = testRunTracker.addTrackingMarkerToFunction(testRun.id, fn);

        testRun.controller = new TestController(testRun);

        testRunTracker.ensureEnabled();

        try {
            result = await markeredfn(testRun.controller);
        }
        catch (err) {
            errList.addError(err);
        }

        if (!errList.hasUncaughtErrorsInTestCode) {
            globalCallsites.callsitesWithoutAwait.forEach(callsite => {
                errList.addError(new MissingAwaitError(callsite));
            });
        }

        if (errList.hasErrors)
            throw errList;

        return result;
    };
}
