const config = require('../../../config');

if (!config.nativeAutomation) {
    describe('[Regression](GH-2969) - Should fail fetch on non exist path with disableNativeAutomation', function () {
        it('Fetch failed', function () {
            return runTests('testcafe-fixtures/fetch-to-non-exist-path.js');
        });
    });
}