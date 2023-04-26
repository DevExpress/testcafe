const { onlyInNativeAutomation } = require('../../../utils/skip-in');

describe('Redirect on the Request Hook', function () {
    onlyInNativeAutomation('Redirect on the Request Hook', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});


