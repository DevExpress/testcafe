import testRunTracker from '../../../../lib/api/test-run-tracker';

fixture `In Promise.then()`;

test('test', async () => {
    return Promise.resolve().then(() => testRunTracker.getContextTestRunId());
});
