import hybridFnTestRunTracker from '../../../../lib/hybrid-function/test-run-tracker';

fixture `In Promise.then()`;

test('test', async () => {
    return Promise.resolve().then(() => hybridFnTestRunTracker.getContextTestRunId());
});
