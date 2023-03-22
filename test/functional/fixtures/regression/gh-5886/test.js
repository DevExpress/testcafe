const { skipInProxyless } = require('../../../utils/skip-in');

describe('[Regression](GH-5886) - Selector for element after switching to the rewritten iframe', function () {
    skipInProxyless('Should exist', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});
