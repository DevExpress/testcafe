const config = require('../../../../config');

if (config.useHeadlessBrowsers && !config.experimentalDebug) {
    describe('[API] t.browser', function () {
        it('Should return browser information', function () {
            return runTests('./testcafe-fixtures/browser-info-test.js', 't.browser', { only: 'chrome' });
        });
    });
}
