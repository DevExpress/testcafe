const { skipInProxyless } = require('../../../utils/skip-in');

describe('[Regression](GH-2861) - Should not hang on custom element click', function () {
    // NOTE: the the test in incorrect for proxyless mode, since the native click is working
    // differently than in the event emulation mode
    skipInProxyless('Click on custom element', function () {
        return runTests('testcafe-fixtures/index.js', null, { only: ['chrome'] });
    });
});
