import hybridFnTestRunTracker from '../../../../lib/client-functions/test-run-tracker';

fixture `In helper`;

function yo () {
    return hybridFnTestRunTracker.getContextTestRunId();
}

test('test', async () => {
    return yo();
});
