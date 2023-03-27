const { onlyInProxyless } = require('../../../utils/skip-in');

describe('[Regression](GH-7575)', function () {
    onlyInProxyless('Authorization header should not be modified in the proxyless mode', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});


