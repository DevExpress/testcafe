var expect                     = require('chai').expect;
var OS                         = require('os-family');
var config                     = require('../../../../config.js');
var errorInEachBrowserContains = require('../../../../assertion-helper.js').errorInEachBrowserContains;


describe('[API] Resize window actions', function () {
    if (config.useLocalBrowsers) {
        describe('t.resizeWindow', function () {
            it('Should resize the window', function () {
                return runTests('./testcafe-fixtures/resize-window-test.js', 'Resize the window');
            });

            it('Should validate height argument', function () {
                return runTests('./testcafe-fixtures/resize-window-test.js', 'Incorrect action height argument', {
                    shouldFail: true,
                    only:       'chrome'
                })
                    .catch(function (errs) {
                        expect(errs[0]).to.contains('The "height" argument is expected to be a positive integer, but it was -5.');
                        expect(errs[0]).to.contains(' > 45 |    await t.resizeWindow(500, -5);');
                    });
            });

            it('Should fail when a js-error appears during resizeWindow execution', function () {
                return runTests('./testcafe-fixtures/resize-window-test.js', 'Resize the window leads to js-error', { shouldFail: true })
                    .catch(function (errs) {
                        errorInEachBrowserContains(errs, 'Error on page "http://localhost:3000/fixtures/api/es-next/resize-window/pages/index.html":', 0);
                        errorInEachBrowserContains(errs, 'Resize error', 0);
                        errorInEachBrowserContains(errs, '> 70 |    await t.resizeWindow(500, 500);', 0);
                    });
            });
        });

        describe('t.resizeWindowToFitDevice', function () {
            it('Should resize the window to fit a device', function () {
                return runTests('./testcafe-fixtures/resize-window-test.js', 'Resize the window to fit a device');
            });

            it('Should resize the window to fit a device with portrait orientation', function () {
                return runTests('./testcafe-fixtures/resize-window-test.js', 'Resize the window to fit a device with portrait orientation');
            });

            it('Should validate device argument', function () {
                return runTests('./testcafe-fixtures/resize-window-test.js', 'Incorrect action device argument', {
                    shouldFail: true,
                    only:       'chrome'
                })
                    .catch(function (errs) {
                        expect(errs[0]).to.contains('The "device" argument specifies an unsupported "iPhone555" device. For a list of supported devices, refer to "http://viewportsizes.com"');
                        expect(errs[0]).to.contains(' > 64 |    await t.resizeWindowToFitDevice(\'iPhone555\');');
                    });
            });

            it('Should fail when a js-error appears during resizeWindowToFitDevice execution', function () {
                return runTests('./testcafe-fixtures/resize-window-test.js', 'Resize the window to fit a device leads to js-error', { shouldFail: true })
                    .catch(function (errs) {
                        errorInEachBrowserContains(errs, 'Error on page "http://localhost:3000/fixtures/api/es-next/resize-window/pages/index.html":', 0);
                        errorInEachBrowserContains(errs, 'Resize error', 0);
                        errorInEachBrowserContains(errs, '> 76 |    await t.resizeWindowToFitDevice(\'iPhone\');', 0);
                    });
            });
        });

        if (OS.mac) {
            it('Should fail when the requested size exceeds the maximum available size', function () {
                return runTests('./testcafe-fixtures/resize-window-test.js', 'Too big size', { shouldFail: true })
                    .catch(function (errs) {
                        errorInEachBrowserContains(errs, 'Unable to resize the window because the specified size exceeds the screen size. On macOS, a window cannot be larger than the screen.', 0);
                        errorInEachBrowserContains(errs, '> 84 |    await t.resizeWindow(hugeWidth, hugeHeight);', 0);
                    });
            });
        }
    }
});
