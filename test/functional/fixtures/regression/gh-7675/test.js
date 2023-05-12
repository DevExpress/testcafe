const { onlyInNativeAutomation } = require('../../../utils/skip-in');

describe('Requests from worker should not fail in native automation', function () {
    onlyInNativeAutomation('`importScripts` in worker should not fail in native automation', function () {
        return runTests('testcafe-fixtures/index.js', '`importScripts` in worker should not fail in native automation');
    });

    onlyInNativeAutomation('The `XHR` request in worker should not fail in native automation', function () {
        return runTests('testcafe-fixtures/index.js', 'The `XHR` request in worker should not fail in native automation');
    });
});
