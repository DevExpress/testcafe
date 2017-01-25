import testRunTracker from '../../../../lib/api/test-run-tracker';

fixture `In test function`
    .beforeEach(async () => {
        return testRunTracker.getContextTestRunId();
    })
    .afterEach(async () => {
        return testRunTracker.getContextTestRunId();
    });

test('test', async () => {
    return testRunTracker.getContextTestRunId();
});
