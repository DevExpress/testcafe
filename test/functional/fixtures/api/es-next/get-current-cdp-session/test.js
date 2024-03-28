const { onlyInNativeAutomation } = require('../../../../utils/skip-in');

describe('[API] Get current CDP session', function () {
    onlyInNativeAutomation('Should return current CPD', function () {
        return runTests('./testcafe-fixtures/index.js', 'Get current CDP session', { experimentalMultipleWindows: true });
    });
});
