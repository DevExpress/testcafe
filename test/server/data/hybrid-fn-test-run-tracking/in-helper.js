import hybridFnTestRunTracker from '../../../../lib/api/common/hybrid/test-run-tracker';

fixture `In helper`;

function yo () {
    return hybridFnTestRunTracker.getOwnerTestRunId();
}

test('test', async () => {
    return yo();
});
