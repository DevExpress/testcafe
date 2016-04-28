import hybridFnTestRunTracker from '../../../../lib/api/common/hybrid/test-run-tracker';

fixture `In setInterval`;

test('test', async () => {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            clearInterval(interval);
            resolve(hybridFnTestRunTracker.getContextTestRunId())
        }, 0);
    });
});
