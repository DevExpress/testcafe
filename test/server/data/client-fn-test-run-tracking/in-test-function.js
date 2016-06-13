import clientFnTestRunTracker from '../../../../lib/client-functions/test-run-tracker';

fixture `In test function`
    .beforeEach(async () => {
        return clientFnTestRunTracker.getContextTestRunId();
    })
    .afterEach(async () => {
        return clientFnTestRunTracker.getContextTestRunId();
    });

test('test', async () => {
    return clientFnTestRunTracker.getContextTestRunId();
});
