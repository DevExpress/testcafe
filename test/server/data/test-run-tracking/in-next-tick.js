import testRunTracker from '../../../../lib/api/test-run-tracker';

fixture `In nextTick`;

test('test', async () => {
    return new Promise(resolve => {
        process.nextTick(() => {
            resolve(testRunTracker.getContextTestRunId())
        });
    });
});
