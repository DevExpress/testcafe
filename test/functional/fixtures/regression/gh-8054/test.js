const { onlyInNativeAutomation } = require('../../../utils/skip-in');

describe('Should not ignore request from service worker (GH-8054)', function () {
    onlyInNativeAutomation('Should not ignore request from service worker (GH-8054)', function () {
        return runTests('./testcafe-fixtures/index.js');
    });
});
