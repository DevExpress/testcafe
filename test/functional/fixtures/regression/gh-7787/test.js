const { onlyInNativeAutomation } = require('../../../utils/skip-in');

describe('[Regression](GH-7787)', function () {
    onlyInNativeAutomation('Should not fail if `statusCode` is set as string', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});


