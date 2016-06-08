import hybridFnTestRunTracker from '../../../../lib/hybrid-function/test-run-tracker';

fixture `In Promise.catch()`;

test('test', async () => {
    return Promise.resolve()
        .then(() => {
            throw new Error('yo')
        })
        .catch(() => hybridFnTestRunTracker.getContextTestRunId());
});
