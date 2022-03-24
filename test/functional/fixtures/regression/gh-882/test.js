const config = require('../../../config');


// TODO: stabilize test in Debug mode
(config.experimentalDebug ? describe.skip : describe)('[Regression](GH-882) Test should not hang when content is scaled or in Hi-DPI mode', function () {
    // NOTE: Test must run on a zoomed page or in Hi-DPI mode
    it('gh-882', function () {
        return runTests('testcafe-fixtures/index-test.js', 'gh-882');
    });
});
