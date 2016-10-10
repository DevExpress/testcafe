var expect                     = require('chai').expect;
var errorInEachBrowserContains = require('../../../../assertion-helper.js').errorInEachBrowserContains;

// NOTE: we set selectorTimeout to a large value in some tests to wait for
// an iframe to load on the farm (it is fast locally but can take some time on the farm)

var DEFAULT_SELECTOR_TIMEOUT   = 5000;
var DEFAULT_RUN_OPTIONS        = { selectorTimeout: DEFAULT_SELECTOR_TIMEOUT };
var DEFAULT_FAILED_RUN_OPTIONS = {
    shouldFail:      true,
    selectorTimeout: DEFAULT_SELECTOR_TIMEOUT
};

describe('[API] t.switchToIframe(), t.switchToMainWindow()', function () {
    this.timeout(60000);

    it('Should switch context between an iframe and the main window', function () {
        return runTests('./testcafe-fixtures/iframe-switching-test.js', 'Click on an element in an iframe and return to the main window',
            DEFAULT_RUN_OPTIONS);
    });

    it('Should switch context between a nested iframe and the main window', function () {
        return runTests('./testcafe-fixtures/iframe-switching-test.js', 'Click on element in a nested iframe', DEFAULT_RUN_OPTIONS);
    });

    it('Should wait while a target iframe is loaded', function () {
        return runTests('./testcafe-fixtures/iframe-switching-test.js', 'Click in a slowly loading iframe', DEFAULT_RUN_OPTIONS);
    });

    it('Should resume execution if an iframe is removed as a result of an action', function () {
        return runTests('./testcafe-fixtures/iframe-switching-test.js', 'Remove an iframe during execution', DEFAULT_RUN_OPTIONS);
    });

    it('Should execute an action in an iframe with redirect', function () {
        return runTests('./testcafe-fixtures/iframe-switching-test.js', 'Click in an iframe with redirect', DEFAULT_RUN_OPTIONS);
    });

    it('Should keep context if the page was reloaded', function () {
        return runTests('./testcafe-fixtures/iframe-switching-test.js', 'Reload the main page from an iframe', DEFAULT_RUN_OPTIONS);
    });

    it('Should correctly switch to the main window context if an iframe was removed from the nested one', function () {
        return runTests('./testcafe-fixtures/iframe-switching-test.js', 'Remove the parent iframe from the nested one', DEFAULT_RUN_OPTIONS);
    });

    it('Should work in an iframe without src', function () {
        return runTests('./testcafe-fixtures/iframe-switching-test.js', 'Click in an iframe without src', DEFAULT_RUN_OPTIONS);
    });

    it('Should work in a cross-domain iframe', function () {
        return runTests('./testcafe-fixtures/iframe-switching-test.js', 'Click in a cross-domain iframe with redirect', DEFAULT_RUN_OPTIONS);
    });

    describe('Unavailable iframe errors', function () {
        it('Should ensure the iframe element exists before switching to it', function () {
            return runTests('./testcafe-fixtures/iframe-switching-test.js', 'Switch to a non-existent iframe',
                { shouldFail: true })
                .catch(function (errs) {
                    expect(errs[0]).to.contains('The specified selector does not match any element in the DOM tree.');
                    expect(errs[0]).to.contains("> 56 |    await t.switchToIframe('#non-existent');");
                });
        });

        it('Should raise an error is the switchContext argument is not an iframe', function () {
            return runTests('./testcafe-fixtures/iframe-switching-test.js', 'Try to switch to an incorrect element', { shouldFail: true })
                .catch(function (errs) {
                    expect(errs[0]).to.contains('The action element is expected to be an <iframe>.');
                    expect(errs[0]).to.contains("> 70 |    await t.switchToIframe('body');");
                });
        });

        it('Should raise an error if a switchToIframe target is not loaded', function () {
            return runTests('./testcafe-fixtures/iframe-switching-test.js', "Click in a iframe that's loading too slowly", {
                shouldFail:      true,
                selectorTimeout: 200
            })
                .catch(function (errs) {
                    expect(errs[0]).to.contains('Content of the iframe to which you are switching did not load.');
                    expect(errs[0]).to.contains("> 180 |        .switchToIframe('#too-slowly-loading-iframe')");
                });
        });

        it('Should raise an error when trying to execute an action in an unavailable iframe', function () {
            return runTests('./testcafe-fixtures/iframe-switching-test.js', 'Click in a removed iframe', DEFAULT_FAILED_RUN_OPTIONS)
                .catch(function (errs) {
                    expect(errs[0]).to.contains('The iframe in which the test is currently operating does not exist anymore.');
                    expect(errs[0]).to.contains("> 89 |        .click('#btn');");
                });
        });

        it('Should raise an error when trying to execute an action in an invisible iframe', function () {
            return runTests('./testcafe-fixtures/iframe-switching-test.js', 'Click in an invisible iframe', DEFAULT_FAILED_RUN_OPTIONS)
                .catch(function (errs) {
                    expect(errs[0]).to.contains('The iframe in which the test is currently operating is not visible anymore.');
                    expect(errs[0]).to.contains("> 192 |        .click('#btn');");
                });
        });

        it('Should raise an error when trying to execute an action in an iframe that is not loaded', function () {
            return runTests('./testcafe-fixtures/iframe-switching-test.js', 'Click in an iframe that is not loaded', {
                shouldFail:      true,
                selectorTimeout: DEFAULT_SELECTOR_TIMEOUT,

                // NOTE: https://github.com/DevExpress/testcafe-hammerhead/issues/667
                skip: 'iphone,ipad'
            })
                .catch(function (errs) {
                    expect(errs[0]).to.contains('Content of the iframe in which the test is currently operating did not load.');
                    expect(errs[0]).to.contains("> 200 |        .click('#second-page-btn');");
                });
        });
    });

    describe('Page errors handling', function () {
        it('Should fail if an error occurs in a same-domain iframe while an action is being executed', function () {
            return runTests('./testcafe-fixtures/page-errors-test.js', 'Error in a same-domain iframe', DEFAULT_FAILED_RUN_OPTIONS)
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, 'Iframe error', 0);
                    errorInEachBrowserContains(errs, ">  9 |        .click('#error-btn');", 0);
                });
        });

        it('Should fail if an error occurs in a same-domain iframe while an action is being executed in the main window', function () {
            return runTests('./testcafe-fixtures/page-errors-test.js', 'Error in an iframe during executing in the main window', DEFAULT_FAILED_RUN_OPTIONS)
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, 'Iframe error', 0);
                    errorInEachBrowserContains(errs, "> 23 |        .click('#error-in-iframe-btn');", 0);
                });
        });

        it('Should fail if an error occurs in the main window while an action is being executed in a cross-domain iframe', function () {
            return runTests('./testcafe-fixtures/page-errors-test.js', 'Error in the main window during executing in an iframe', DEFAULT_FAILED_RUN_OPTIONS)
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, 'Main window error', 0);
                    errorInEachBrowserContains(errs, "> 29 |        .click('#error-in-main-window-btn');", 0);
                });
        });

        it('Should fail if an error occurs in a same-domain iframe while an action is being executed in another iframe', function () {
            return runTests('./testcafe-fixtures/page-errors-test.js', 'Error in an iframe during execution in another iframe', DEFAULT_FAILED_RUN_OPTIONS)
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, 'Iframe error', 0);
                    errorInEachBrowserContains(errs, "> 35 |        .click('#error-in-another-iframe-btn');", 0);
                });
        });
    });
});
