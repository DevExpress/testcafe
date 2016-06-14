import clientFnTestRunTracker from '../../../../lib/client-functions/test-run-tracker';

fixture `In setTimeout`;

test('test', async () => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(clientFnTestRunTracker.getContextTestRunId())
        }, 0);
    });
});
