import hybridFnTestRunTracker from '../../../../lib/hybrid-functions/test-run-tracker';

fixture `In nextTick`;

test('test', async () => {
    return new Promise(resolve => {
        process.nextTick(() => {
            resolve(hybridFnTestRunTracker.getContextTestRunId())
        });
    });
});
