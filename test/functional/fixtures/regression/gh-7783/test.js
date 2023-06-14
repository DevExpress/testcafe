const { onlyInNativeAutomation } = require('../../../utils/skip-in');

describe('[Regression](GH-7783)', function () {
    onlyInNativeAutomation('Trim BOM symbol in Native Automation', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});
