import hybridFnTestRunTracker from '../../../../lib/client-functions/test-run-tracker';

fixture `In helper after "await"`;

function yo () {
    return hybridFnTestRunTracker.getContextTestRunId();
}

function hey () {
    return Promise.resolve();
}

test('test', async () => {
    await hey();

    return yo();
});
