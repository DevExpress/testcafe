import clientFnTestRunTracker from '../../../../lib/client-functions/test-run-tracker';

fixture `In helper`;

function yo () {
    return clientFnTestRunTracker.getContextTestRunId();
}

test('test', async () => {
    return yo();
});
