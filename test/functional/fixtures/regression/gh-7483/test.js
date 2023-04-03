const { onlyInNativeAutomation } = require('../../../utils/skip-in');

describe('[Regression](GH-7483)', function () {
    onlyInNativeAutomation('Should click on the element if the element is behind the Status Bar', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});


