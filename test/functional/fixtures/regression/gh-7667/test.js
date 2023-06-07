const { onlyInNativeAutomation } = require('../../../utils/skip-in');

describe('[Regression](GH-7667)', function () {
    onlyInNativeAutomation('Should select and remove text from input', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});
