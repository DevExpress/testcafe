import testRunTracker from '../../../../lib/api/test-run-tracker';

fixture `In helper`;

function yo () {
    return testRunTracker.getContextTestRunId();
}

test('test', async () => {
    return yo();
});
