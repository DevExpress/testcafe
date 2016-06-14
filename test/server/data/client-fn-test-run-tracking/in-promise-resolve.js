import clientFnTestRunTracker from '../../../../lib/client-functions/test-run-tracker';

fixture `In Promise.then()`;

test('test', async () => {
    return Promise
        .resolve(() => {
            return clientFnTestRunTracker.getContextTestRunId()
        })
        .then(fn => fn());
});
