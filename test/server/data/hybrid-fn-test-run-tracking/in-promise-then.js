import hybridFnTestRunTracker from '../../../../lib/hybrid-functions/test-run-tracker';

fixture `In Promise.then()`;

test('test', async () => {
    return Promise.resolve().then(() => hybridFnTestRunTracker.getContextTestRunId());
});
