import hybridFnTestRunTracker from '../../../../lib/hybrid-functions/test-run-tracker';

fixture `In setTimeout`;

test('test', async () => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(hybridFnTestRunTracker.getContextTestRunId())
        }, 0);
    });
});
