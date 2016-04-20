import hybridFnTestRunTracker from '../../../../lib/api/common/hybrid/test-run-tracker';

fixture `In setTimeout`;

test('test', async () => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(hybridFnTestRunTracker.getOwnerTestRunId())
        }, 0);
    });
});
