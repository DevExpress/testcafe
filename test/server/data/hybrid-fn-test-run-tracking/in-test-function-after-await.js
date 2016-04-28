import hybridFnTestRunTracker from '../../../../lib/api/common/hybrid/test-run-tracker';

fixture `In test function after "await"`;

async function yo () {
    return 1;
}

test('test', async () => {
    await yo();

    return hybridFnTestRunTracker.getContextTestRunId();
});
