import hybridFnTestRunTracker from '../../../../lib/api/hybrid-functions/test-run-tracker';

fixture `In setInterval`;

test('test', async () => {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            clearInterval(interval);
            resolve(hybridFnTestRunTracker.getContextTestRunId())
        }, 0);
    });
});
