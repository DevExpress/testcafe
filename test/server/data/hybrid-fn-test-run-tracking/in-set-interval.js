import hybridFnTestRunTracker from '../../../../lib/hybrid-function/test-run-tracker';

fixture `In setInterval`;

test('test', async () => {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            clearInterval(interval);
            resolve(hybridFnTestRunTracker.getContextTestRunId())
        }, 0);
    });
});
