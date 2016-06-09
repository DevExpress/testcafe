import hybridFnTestRunTracker from '../../../../lib/client-functions/test-run-tracker';

fixture `In Promise.then()`;

test('test', async () => {
    return Promise
        .resolve(() => {
            return hybridFnTestRunTracker.getContextTestRunId()
        })
        .then(fn => fn());
});
