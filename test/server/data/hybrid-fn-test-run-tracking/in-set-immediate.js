import hybridFnTestRunTracker from '../../../../lib/api/common/hybrid/test-run-tracker';

fixture `In setImmediate`;

test('test', async () => {
    return new Promise(resolve => {
        setImmediate(() => {
            resolve(hybridFnTestRunTracker.getOwnerTestRunId())
        }, 0);
    });
});
