var errorInEachBrowserContains                = require('../../../../../assertion-helper.js').errorInEachBrowserContains;
var getNativeDialogNotHandledErrorText        = require('../errors.js').getNativeDialogNotHandledErrorText;
var getUncaughtErrorInNativeDialogHandlerText = require('../errors.js').getUncaughtErrorInNativeDialogHandlerText;


// NOTE: we set selectorTimeout to a large value in some tests to wait for
// an iframe to load on the farm (it is fast locally but can take some time on the farm)
var DEFAULT_SELECTOR_TIMEOUT             = 5000;
var DEFAULT_RUN_IN_IFRAME_OPTIONS        = { selectorTimeout: DEFAULT_SELECTOR_TIMEOUT };
var DEFAULT_FAILED_RUN_IN_IFRAME_OPTIONS = {
    shouldFail:      true,
    selectorTimeout: DEFAULT_SELECTOR_TIMEOUT
};
var pageUrl                              = 'http://localhost:3000/fixtures/api/es-next/native-dialogs-handling/iframe/pages/page-with-iframe.html';
var iframeUrl                            = 'http://localhost:3000/fixtures/api/es-next/native-dialogs-handling/iframe/pages/iframe.html';
var pageLoadingUrl                       = 'http://localhost:3000/fixtures/api/es-next/native-dialogs-handling/iframe/pages/page-load.html';


describe('Native dialogs handling in iframe', function () {
    describe('Actions in iframe, dialogs in iframe', function () {
        it('Should fail if an unexpected confirm dialog appears after an action', function () {
            return runTests('./testcafe-fixtures/in-iframe-test.js', 'Without handler',
                { shouldFail: true, selectorTimeout: DEFAULT_SELECTOR_TIMEOUT, skipJsErrors: true })
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, getNativeDialogNotHandledErrorText('alert', iframeUrl), 0);
                    errorInEachBrowserContains(errs, '> 20 |        .click(\'#buttonAlert\'); ', 0);
                });
        });

        it('Should pass if the expected alert dialog appears after an action', function () {
            return runTests('./testcafe-fixtures/in-iframe-test.js', 'Expected alert in iframe after an action in iframe',
                DEFAULT_RUN_IN_IFRAME_OPTIONS);
        });

        it('Should fail if confirm dialog appears with wrong text', function () {
            return runTests('./testcafe-fixtures/in-iframe-test.js', 'Alert dialog with wrong text', DEFAULT_FAILED_RUN_IN_IFRAME_OPTIONS)
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, getUncaughtErrorInNativeDialogHandlerText('alert', 'Wrong dialog text', iframeUrl), 0);
                    errorInEachBrowserContains(errs, '> 40 |        .click(\'#buttonAlert\'); ', 0);
                });
        });

        it("Should fail if the expected alert dialog doesn't appear after an action", function () {
            return runTests('./testcafe-fixtures/in-iframe-test.js', 'No expected alert after an action in iframe',
                DEFAULT_FAILED_RUN_IN_IFRAME_OPTIONS)
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, 'AssertionError: expected 0 to equal', 0);
                    errorInEachBrowserContains(errs, '> 51 |    expect(info.length).equals(1); ', 0);
                });
        });
    });

    describe('Actions in top window, dialogs in iframe', function () {
        it('Should pass if the expected alert dialog appears after an action', function () {
            return runTests('./testcafe-fixtures/in-iframe-test.js', 'Expected alert in iframe after an action in top window', DEFAULT_RUN_IN_IFRAME_OPTIONS);
        });

        it('Should fail when an unexpected alert dialog appears after an action', function () {
            return runTests('./testcafe-fixtures/in-iframe-test.js', 'Unexpected alert in iframe after an action in top window',
                DEFAULT_FAILED_RUN_IN_IFRAME_OPTIONS)
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, getNativeDialogNotHandledErrorText('alert', iframeUrl), 0);
                    errorInEachBrowserContains(errs, ' > 77 |        .click(\'#buttonIframeAlert\');', 0);
                });
        });
    });

    describe('Actions in iframe, dialogs in top window', function () {
        it('Should pass if the expected alert dialog appears after an action', function () {
            return runTests('./testcafe-fixtures/in-iframe-test.js', 'Expected alert in top window after an action in iframe',
                DEFAULT_RUN_IN_IFRAME_OPTIONS);
        });

        it('Should fail when an unexpected alert dialog appears after an action', function () {
            return runTests('./testcafe-fixtures/in-iframe-test.js', 'Unexpected alert in top window after an action in iframe',
                DEFAULT_FAILED_RUN_IN_IFRAME_OPTIONS)
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, getNativeDialogNotHandledErrorText('alert', pageUrl), 0);
                    errorInEachBrowserContains(errs, ' >  95 |        .click(\'#buttonTopWindowAlert\');', 0);
                });
        });
    });

    describe('Actions in nested iframes', function () {
        it('Should pass if the expected alert dialog appears in parent iframe after an action', function () {
            return runTests('./testcafe-fixtures/in-iframe-test.js', 'Expected alert in parent iframe after an action in child iframe',
                DEFAULT_RUN_IN_IFRAME_OPTIONS);
        });

        it('Should pass if the expected alert dialog appears in child iframe after an action', function () {
            return runTests('./testcafe-fixtures/in-iframe-test.js', 'Expected alert in child iframe after an action in parent iframe',
                DEFAULT_RUN_IN_IFRAME_OPTIONS);
        });
    });

    describe('Dialogs appear after page load', function () {
        it('Should pass if the expected confirm dialog appears after page load', function () {
            return runTests('./testcafe-fixtures/page-load-test.js', 'Expected dialogs after page load', DEFAULT_RUN_IN_IFRAME_OPTIONS);
        });

        it('Should fail when an unexpected alert dialog appears after page load', function () {
            return runTests('./testcafe-fixtures/page-load-test.js', 'Unexpected alert after page load',
                DEFAULT_FAILED_RUN_IN_IFRAME_OPTIONS)
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, getNativeDialogNotHandledErrorText('alert', pageLoadingUrl), 0);
                    errorInEachBrowserContains(errs, '> 28 |    await t.click(\'body\'); ', 0);
                });
        });
    });
});
