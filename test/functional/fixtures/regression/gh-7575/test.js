const { onlyInNativeAutomation } = require('../../../utils/skip-in');

describe('[Regression](GH-7575)', function () {
    onlyInNativeAutomation('Authorization header should not be modified in the native automation mode', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});


