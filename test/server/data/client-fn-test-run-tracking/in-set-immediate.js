import clientFnTestRunTracker from '../../../../lib/client-functions/test-run-tracker';

fixture `In setImmediate`;

test('test', async () => {
    return new Promise(resolve => {
        setImmediate(() => {
            resolve(clientFnTestRunTracker.getContextTestRunId())
        }, 0);
    });
});
