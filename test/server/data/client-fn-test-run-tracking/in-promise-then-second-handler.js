import clientFnTestRunTracker from '../../../../lib/client-functions/test-run-tracker';

fixture `In Promise.then() second handler`;

test('test', async () => {
    return Promise.resolve()
        .then(() => {
            throw new Error('yo')
        })
        .then(() => null, () => clientFnTestRunTracker.getContextTestRunId());
});
