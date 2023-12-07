const { onlyDescribeInNativeAutomation } = require('../../../utils/skip-in');

onlyDescribeInNativeAutomation('[Regression](GH-7529)', function () {
    it('In Native Automation mode, the page should be decoded as in proxy mode', function () {
        return runTests('./testcafe-fixtures/index.js');
    });
});
