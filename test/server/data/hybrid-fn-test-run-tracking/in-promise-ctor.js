import hybridFnTestRunTracker from '../../../../lib/hybrid-function/test-run-tracker';

fixture `In Promise ctor`;

test('test', async () => {
    return new Promise(resolve => resolve(hybridFnTestRunTracker.getContextTestRunId()));
});
