import testRunTracker from '../../../../lib/api/test-run-tracker';

fixture `In setTimeout`;

test('test', async () => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(testRunTracker.getContextTestRunId())
        }, 0);
    });
});
