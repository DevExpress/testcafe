import testRunTracker from '../../../../lib/api/test-run-tracker';

fixture `In Promise.then() second handler`;

test('test', async () => {
    return Promise.resolve()
        .then(() => {
            throw new Error('yo')
        })
        .then(() => null, () => testRunTracker.getContextTestRunId());
});
