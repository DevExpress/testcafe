const { skipDescribeInNativeAutomation } = require('../../../utils/skip-in');

// NOTE: This test suit tests localStorage synchronisation between windows. We didn't support multiple windows in CDP yet.
// We need to turn on these tests and implement cache-control response header in proxyless once multiple windows are supported.

skipDescribeInNativeAutomation('Disable page caching', () => {
    it('Test run', () => {
        return runTests('testcafe-fixtures/test-run.js', null, { disablePageCaching: true, disableMultipleWindows: true });
    });

    it('Fixture', () => {
        return runTests('testcafe-fixtures/fixture.js', null, { disableMultipleWindows: true });
    });

    it('Single test', () => {
        return runTests('testcafe-fixtures/single-test.js', null, { disableMultipleWindows: true });
    });
});

