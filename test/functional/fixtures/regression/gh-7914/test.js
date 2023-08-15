const { onlyInNativeAutomation } = require('../../../utils/skip-in');

describe('[Regression](GH-7914) Native Automation: ClientScripts + RequestMock', function () {
    onlyInNativeAutomation('Native Automation: ClientScripts + RequestMock', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});


