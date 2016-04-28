import hybridFnTestRunTracker from '../../../../lib/api/common/hybrid/test-run-tracker';

fixture `In helper`;

function yo () {
    return hybridFnTestRunTracker.getContextTestRunId();
}

test('test', async () => {
    return yo();
});
