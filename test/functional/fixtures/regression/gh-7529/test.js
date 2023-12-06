const config = require('../../../config.js');

if (config.nativeAutomation) {
    describe('[Regression](GH-7529)', function () {
        it('In Native Automation mode, the page should be decoded as in proxy mode', function () {
            return runTests('./testcafe-fixtures/index.js');
        });
    });
}
