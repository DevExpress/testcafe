import hybridFnTestRunTracker from '../../../../lib/hybrid-function/test-run-tracker';

fixture `In setImmediate`;

test('test', async () => {
    return new Promise(resolve => {
        setImmediate(() => {
            resolve(hybridFnTestRunTracker.getContextTestRunId())
        }, 0);
    });
});
