const { skipInProxyless } = require('../../../utils/skip-in');

describe('[Regression](GH-2861) - Should not hang on custom element click', function () {
    skipInProxyless('Click on custom element', function () {
        return runTests('testcafe-fixtures/index.js', null, { only: ['chrome'] });
    });
});
