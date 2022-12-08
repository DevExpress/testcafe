import testRunTracker from './test-run-tracker';
import wrapTestFunction, { WrapTestFunctionExecutorArguments } from './wrap-test-function';

export default function wrapCustomAction (fn: Function): Function {
    const executor = async function ({ testRun, functionArgs }: WrapTestFunctionExecutorArguments): Promise<any> {
        const markeredfn = testRunTracker.addTrackingMarkerToFunction(testRun.id, fn, testRun.controller);

        return await markeredfn(...functionArgs);
    };

    return wrapTestFunction(fn, executor);
}
