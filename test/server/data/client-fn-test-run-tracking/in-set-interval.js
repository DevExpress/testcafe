import clientFnTestRunTracker from '../../../../lib/client-functions/test-run-tracker';

fixture `In setInterval`;

test('test', async () => {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            clearInterval(interval);
            resolve(clientFnTestRunTracker.getContextTestRunId())
        }, 0);
    });
});
