import TestController from './test-controller';
import testRunTracker from './test-run-tracker';
import TestRun from '../test-run';
import TestCafeErrorList from '../errors/error-list';
import { MissingAwaitError } from '../errors/test-run';
import addRenderedWarning from '../notifications/add-rendered-warning';
import WARNING_MESSAGES from '../notifications/warning-message';
import { addErrors, addWarnings } from './test-controller/add-errors';

export default function wrapCustomAction (fn: Function): Function {
    return async (testRun: TestRun, functionArgs: any) => {
        let result       = null;
        const errList    = new TestCafeErrorList();

        testRun.controller = new TestController(testRun);

        const markeredfn = testRunTracker.addTrackingMarkerToFunction(testRun.id, fn, testRun.controller);

        testRun.observedCallsites.clear();
        testRunTracker.ensureEnabled();

        try {
            result = await markeredfn(...functionArgs);
        }
        catch (err) {
            errList.addError(err);
        }

        if (!errList.hasUncaughtErrorsInTestCode) {
            for (const { callsite, actionId } of testRun.observedCallsites.awaitedSnapshotWarnings.values())
                addRenderedWarning(testRun.warningLog, { message: WARNING_MESSAGES.excessiveAwaitInAssertion, actionId }, callsite);

            addWarnings(testRun.observedCallsites.unawaitedSnapshotCallsites, WARNING_MESSAGES.missingAwaitOnSnapshotProperty, testRun);
            addErrors(testRun.observedCallsites.callsitesWithoutAwait, MissingAwaitError, errList);
        }

        if (errList.hasErrors)
            throw errList;

        return result;
    };
}
