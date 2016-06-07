import hybridFnTestRunTracker from '../../../../lib/hybrid-functions/test-run-tracker';

fixture `In test function`
    .beforeEach(async () => {
        return hybridFnTestRunTracker.getContextTestRunId();
    })
    .afterEach(async () => {
        return hybridFnTestRunTracker.getContextTestRunId();
    });

test('test', async () => {
    return hybridFnTestRunTracker.getContextTestRunId();
});
