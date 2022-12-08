import testRunTracker from './test-run-tracker';
import TestRun from '../test-run';
import TestController from './test-controller';
import TestCafeErrorList from '../errors/error-list';
import { MissingAwaitError } from '../errors/test-run';
import addRenderedWarning from '../notifications/add-rendered-warning';
import WARNING_MESSAGES from '../notifications/warning-message';
import { addErrors, addWarnings } from './test-controller/add-message';

export interface WrapTestFunctionExecutorArguments {
    testRun: TestRun;
    functionArgs: any[];
    fn: Function;
}

const defaultExecutor = async function ({ testRun, fn }: WrapTestFunctionExecutorArguments): Promise<any> {
    const markeredfn = testRunTracker.addTrackingMarkerToFunction(testRun.id, fn);

    return await markeredfn(testRun.controller);
};

export default function wrapTestFunction (fn: Function, executor: Function = defaultExecutor): Function {
    return async (testRun: TestRun, functionArgs: any) => {
        let result    = null;
        const errList = new TestCafeErrorList();

        testRun.controller = new TestController(testRun);

        testRun.observedCallsites.clear();
        testRunTracker.ensureEnabled();

        try {
            result = await executor({ fn, functionArgs, testRun });
        }
        catch (err) {
            errList.addError(err);
        }

        if (!errList.hasUncaughtErrorsInTestCode) {
            for (const { callsite, actionId } of testRun.observedCallsites.awaitedSnapshotWarnings.values()) {
                addRenderedWarning(testRun.warningLog, {
                    message: WARNING_MESSAGES.excessiveAwaitInAssertion,
                    actionId,
                }, callsite);
            }

            addWarnings(testRun.observedCallsites.unawaitedSnapshotCallsites, WARNING_MESSAGES.missingAwaitOnSnapshotProperty, testRun);
            addErrors(testRun.observedCallsites.callsitesWithoutAwait, MissingAwaitError, errList);
        }

        if (errList.hasErrors)
            throw errList;

        return result;
    };
}

