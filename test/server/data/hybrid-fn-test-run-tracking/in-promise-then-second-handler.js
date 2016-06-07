import hybridFnTestRunTracker from '../../../../lib/api/hybrid-functions/test-run-tracker';

fixture `In Promise.then() second handler`;

test('test', async () => {
    return Promise.resolve()
        .then(() => {
            throw new Error('yo')
        })
        .then(() => null, () => hybridFnTestRunTracker.getContextTestRunId());
});
