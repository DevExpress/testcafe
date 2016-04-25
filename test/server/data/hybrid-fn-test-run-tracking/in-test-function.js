import hybridFnTestRunTracker from '../../../../lib/api/common/hybrid/test-run-tracker';

fixture `In test function`
    .beforeEach(async () => {
        return hybridFnTestRunTracker.getOwnerTestRunId();
    })
    .afterEach(async () => {
        return hybridFnTestRunTracker.getOwnerTestRunId();
    });

test('test', async () => {
    return hybridFnTestRunTracker.getOwnerTestRunId();
});
