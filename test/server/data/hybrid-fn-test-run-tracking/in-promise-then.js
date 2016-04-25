import hybridFnTestRunTracker from '../../../../lib/api/common/hybrid/test-run-tracker';

fixture `In Promise.then()`;

test('test', async () => {
    return Promise.resolve().then(() => hybridFnTestRunTracker.getOwnerTestRunId());
});
