const { onlyInProxyless } = require('../../../utils/skip-in');

describe('[Regression](GH-7566)', function () {
    onlyInProxyless('Should has the "which" property equal to "0" for move events', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});


