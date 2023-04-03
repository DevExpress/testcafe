const { skipInNativeAutomation } = require('../../../utils/skip-in');

describe('[Regression](GH-1311)', function () {
    skipInNativeAutomation('Should raise "input" event while changing value in select input', function () {
        return runTests('testcafe-fixtures/index.test.js', 'Click on select option (Non IE)');
    });
});
