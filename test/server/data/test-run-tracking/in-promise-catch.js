import testRunTracker from '../../../../lib/api/test-run-tracker';

fixture `In Promise.catch()`;

test('test', async () => {
    return Promise.resolve()
        .then(() => {
            throw new Error('yo')
        })
        .catch(() => testRunTracker.getContextTestRunId());
});
