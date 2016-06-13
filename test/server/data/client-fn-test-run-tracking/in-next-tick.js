import clientFnTestRunTracker from '../../../../lib/client-functions/test-run-tracker';

fixture `In nextTick`;

test('test', async () => {
    return new Promise(resolve => {
        process.nextTick(() => {
            resolve(clientFnTestRunTracker.getContextTestRunId())
        });
    });
});
