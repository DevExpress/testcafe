import hybridFnTestRunTracker from '../../../../lib/client-functions/test-run-tracker';

fixture `In test function after "await"`;

async function yo () {
    return 1;
}

test('test', async () => {
    await yo();

    return hybridFnTestRunTracker.getContextTestRunId();
});
