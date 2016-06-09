import hybridFnTestRunTracker from '../../../../lib/client-functions/test-run-tracker';

fixture `In Promise ctor`;

test('test', async () => {
    return new Promise(resolve => resolve(hybridFnTestRunTracker.getContextTestRunId()));
});
