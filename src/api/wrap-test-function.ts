import TestController from './test-controller';
import testRunTracker from './test-run-tracker';
import TestRun from '../test-run';
import TestCafeErrorList from '../errors/error-list';
import { MissingAwaitError } from '../errors/test-run';
import addRenderedWarning from '../notifications/add-rendered-warning';
import WARNING_MESSAGES from '../notifications/warning-message';

export default function wrapTestFunction (fn: Function): Function {
    return async (testRun: TestRun) => {
        let result       = null;
        const errList    = new TestCafeErrorList();
        const markeredfn = testRunTracker.addTrackingMarkerToFunction(testRun.id, fn);

        function addWarnings (callsiteSet: Set<Record<string, any>>, message: string): void {
            callsiteSet.forEach(callsite => {
                addRenderedWarning(testRun.warningLog, message, callsite);
                callsiteSet.delete(callsite);
            });
        }

        function addErrors (callsiteSet: Set<Record<string, any>>, ErrorClass: any): void {
            callsiteSet.forEach(callsite => {
                errList.addError(new ErrorClass(callsite));
                callsiteSet.delete(callsite);
            });
        }

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
            for (const callsite of testRun.observedCallsites.awaitedSnapshotWarnings.values())
                addRenderedWarning(testRun.warningLog, WARNING_MESSAGES.excessiveAwaitInAssertion, callsite);

            addWarnings(testRun.observedCallsites.unawaitedSnapshotCallsites, WARNING_MESSAGES.missingAwaitOnSnapshotProperty);
            addErrors(testRun.observedCallsites.callsitesWithoutAwait, MissingAwaitError);
        }

        if (errList.hasErrors)
            throw errList;

        return result;
    };
}
