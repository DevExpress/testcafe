import hybridFnTestRunTracker from '../../../../lib/api/hybrid-functions/test-run-tracker';

fixture `In Promise ctor`;

test('test', async () => {
    return new Promise(resolve => resolve(hybridFnTestRunTracker.getContextTestRunId()));
});
