import testRunTracker from '../../../../lib/api/test-run-tracker';

fixture `In Promise ctor`;

test('test', async () => {
    return new Promise(resolve => resolve(testRunTracker.getContextTestRunId()));
});
