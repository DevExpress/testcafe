const { onlyInNativeAutomation } = require('../../../utils/skip-in');

describe('`importScripts` in worker should not fail in native automation', function () {
    onlyInNativeAutomation('`importScripts` in worker should not fail in native automation', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});
