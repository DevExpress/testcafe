import hybridFnTestRunTracker from '../../../../lib/hybrid-function/test-run-tracker';

fixture `In Promise.then() second handler`;

test('test', async () => {
    return Promise.resolve()
        .then(() => {
            throw new Error('yo')
        })
        .then(() => null, () => hybridFnTestRunTracker.getContextTestRunId());
});
