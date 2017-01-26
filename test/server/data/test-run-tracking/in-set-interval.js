import testRunTracker from '../../../../lib/api/test-run-tracker';

fixture `In setInterval`;

test('test', async () => {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            clearInterval(interval);
            resolve(testRunTracker.getContextTestRunId())
        }, 0);
    });
});
