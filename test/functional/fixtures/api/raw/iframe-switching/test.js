var errorInEachBrowserContains = require('../../../../assertion-helper.js').errorInEachBrowserContains;

// NOTE: we set selectorTimeout to a large value in some tests to wait for
// an iframe to load on the farm (it is fast locally but can take some time on the farm)

describe('[RAW] t.switchToIframe(), t.switchToMainWindow()', function () {
    this.timeout(60000);

    it('Should switch context between a nested iframe and the main window', function () {
        return runTests('./testcafe-fixtures/iframe-switching.testcafe', 'Click on element in a nested iframe',
            { shouldFail: true, selectorTimeout: 5000 })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'top window button clicked: 2; iframe button clicked: 1;' +
                                                 ' nested iframe button clicked: 1;', 0);
            });
    });
});
