import hybridFnTestRunTracker from '../../../../lib/api/common/hybrid/test-run-tracker';

fixture `In Promise ctor`;

test('test', async () => {
    return new Promise(resolve => resolve(hybridFnTestRunTracker.getContextTestRunId()));
});
