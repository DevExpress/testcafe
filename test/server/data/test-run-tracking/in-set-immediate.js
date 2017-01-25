import testRunTracker from '../../../../lib/api/test-run-tracker';

fixture `In setImmediate`;

test('test', async () => {
    return new Promise(resolve => {
        setImmediate(() => {
            resolve(testRunTracker.getContextTestRunId())
        }, 0);
    });
});
