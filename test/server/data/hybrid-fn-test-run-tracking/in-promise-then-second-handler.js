import hybridFnTestRunTracker from '../../../../lib/api/common/hybrid/test-run-tracker';

fixture `In Promise.then() second handler`;

test('test', async () => {
    return Promise.resolve()
        .then(() => {
            throw new Error('yo')
        })
        .then(() => null, () => hybridFnTestRunTracker.getOwnerTestRunId());
});
