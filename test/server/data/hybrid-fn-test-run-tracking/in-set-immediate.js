import hybridFnTestRunTracker from '../../../../lib/client-functions/test-run-tracker';

fixture `In setImmediate`;

test('test', async () => {
    return new Promise(resolve => {
        setImmediate(() => {
            resolve(hybridFnTestRunTracker.getContextTestRunId())
        }, 0);
    });
});
