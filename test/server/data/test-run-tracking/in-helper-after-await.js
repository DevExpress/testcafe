import testRunTracker from '../../../../lib/api/test-run-tracker';

fixture `In helper after "await"`;

function yo () {
    return testRunTracker.getContextTestRunId();
}

function hey () {
    return Promise.resolve();
}

test('test', async () => {
    await hey();

    return yo();
});
