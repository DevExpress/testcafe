import hybridFnTestRunTracker from '../../../../lib/hybrid-function/test-run-tracker';

fixture `In nextTick`;

test('test', async () => {
    return new Promise(resolve => {
        process.nextTick(() => {
            resolve(hybridFnTestRunTracker.getContextTestRunId())
        });
    });
});
