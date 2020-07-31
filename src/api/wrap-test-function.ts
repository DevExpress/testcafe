import TestController from './test-controller';
import testRunTracker from './test-run-tracker';
import { TestRun } from './test-run-tracker.d';
import TestCafeErrorList from '../errors/error-list';
import { MissingAwaitError } from '../errors/test-run';
import addWarning from '../notifications/add-rendered-warning';
import WARNING_MESSAGES from '../notifications/warning-message';

export default function wrapTestFunction (fn: Function): Function {
    return async (testRun: TestRun) => {
        let result       = null;
        const errList    = new TestCafeErrorList();
        const markeredfn = testRunTracker.addTrackingMarkerToFunction(testRun.id, fn);

        testRun.controller = new TestController(testRun);

        testRun.observedCallsites.clear();

        testRunTracker.ensureEnabled();

        try {
            result = await markeredfn(testRun.controller);
        }
        catch (err) {
            errList.addError(err);
        }

        if (!errList.hasUncaughtErrorsInTestCode) {
            // These look very similar, should I extract them into a separate function?
            for (const callsite of testRun.observedCallsites.callsitesWithoutAwait) {
                errList.addError(new MissingAwaitError(callsite));
                testRun.observedCallsites.callsitesWithoutAwait.delete(callsite);
            }

            for (const callsite of testRun.observedCallsites.unawaitedSnapshotCallsites) {
                addWarning(testRun.warningLog, WARNING_MESSAGES.missingAwaitOnSnapshotProperty, callsite);
                testRun.observedCallsites.unawaitedSnapshotCallsites.delete(callsite);
            }
        }

        if (errList.hasErrors)
            throw errList;

        return result;
    };
}
