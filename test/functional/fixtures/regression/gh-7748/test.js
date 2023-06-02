const { onlyInNativeAutomation } = require('../../../utils/skip-in');

describe('[Regression](GH-7747)', function () {
    onlyInNativeAutomation('Should modify header on RequestHook', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});


