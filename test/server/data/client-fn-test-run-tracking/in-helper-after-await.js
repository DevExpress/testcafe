import clientFnTestRunTracker from '../../../../lib/client-functions/test-run-tracker';

fixture `In helper after "await"`;

function yo () {
    return clientFnTestRunTracker.getContextTestRunId();
}

function hey () {
    return Promise.resolve();
}

test('test', async () => {
    await hey();

    return yo();
});
