import hybridFnTestRunTracker from '../../../../lib/client-functions/test-run-tracker';

fixture `In setTimeout`;

test('test', async () => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(hybridFnTestRunTracker.getContextTestRunId())
        }, 0);
    });
});
