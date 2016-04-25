import hybridFnTestRunTracker from '../../../../lib/api/common/hybrid/test-run-tracker';

fixture `In test function after "await" with error`;

async function yo () {
    throw new Error('yo');
}

test('test', async () => {
    try {
        await yo();
    }
    catch (err) {
        return hybridFnTestRunTracker.getOwnerTestRunId();
    }
});
