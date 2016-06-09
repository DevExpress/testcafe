import hybridFnTestRunTracker from '../../../../lib/hybrid-function/test-run-tracker';

fixture `In helper`;

function yo () {
    return hybridFnTestRunTracker.getContextTestRunId();
}

test('test', async () => {
    return yo();
});
