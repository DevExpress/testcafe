import hybridFnTestRunTracker from '../../../../lib/api/common/hybrid/test-run-tracker';

fixture `In helper after "await"`;

function yo () {
    return hybridFnTestRunTracker.getOwnerTestRunId();
}

function hey () {
    return Promise.resolve();
}

test('test', async () => {
    await hey();

    return yo();
});
