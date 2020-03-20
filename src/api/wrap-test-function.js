import TestController from './test-controller';
import testRunTracker from './test-run-tracker';
import TestCafeErrorList from '../errors/error-list';
import { MissingAwaitError } from '../errors/test-run';
import TestRunErrorFormattableAdapter from '../errors/test-run/formattable-adapter';


export default function wrapTestFunction (fn) {
    return async testRun => {
        let result         = null;
        let screenshotPath = null;
        let executionError = null;
        const errList      = new TestCafeErrorList();
        const markeredfn   = testRunTracker.addTrackingMarkerToFunction(testRun.id, fn);

        testRun.controller = new TestController(testRun);

        testRunTracker.ensureEnabled();

        try {
            result = await markeredfn(testRun.controller);
        }
        catch (err) {
            if (err instanceof TestRunErrorFormattableAdapter)
                executionError = err;
            else
                errList.addError(err);
        }

        if (!errList.hasUncaughtErrorsInTestCode) {
            testRun.controller.callsitesWithoutAwait.forEach(callsite => {
                errList.addError(new MissingAwaitError(callsite));
            });
        }

        if (errList.hasErrors) {
            screenshotPath = executionError && executionError.screenshotPath;

            await testRun.addErrorWithScreenshot(errList, screenshotPath);
        }

        if (testRun.errs.length)
            throw testRun.errs;

        return result;
    };
}
