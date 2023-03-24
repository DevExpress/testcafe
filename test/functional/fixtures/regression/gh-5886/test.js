const { skipInProxyless } = require('../../../utils/skip-in');

describe('[Regression](GH-5886) - Selector for element after switching to the rewritten iframe', function () {
    // NOTE: iframe without src, create on client side, content is added using the `write` method.
    // proxy mode has some additional scripts to process this scenario
    skipInProxyless('Should exist', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});
