var config = require('../../../../config.js');
var expect = require('chai').expect;


if (!config.isTravisTask) {
    describe('[API] Resize window actions', function () {
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
                        expect(errs[0]).to.contains('The height argument is expected to be a positive integer, but it was -5.');
                        expect(errs[0]).to.contains(
                            '40 |    expect(await getWindowWidth()).equals(newWidth); ' +
                            '41 |    expect(await getWindowHeight()).equals(newHeight); ' +
                            '42 |}); ' +
                            '43 | ' +
                            '44 |test(\'Incorrect action height argument\', async t => {' +
                            ' > 45 |    await t.resizeWindow(500, -5); ' +
                            '46 |}); ' +
                            '47 | ' +
                            '48 |test(\'Resize the window to fit a device\', async t => { ' +
                            '49 |    await t.resizeWindowToFitDevice(\'iPhone\');'
                        );
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
                        expect(errs[0]).to.contains('The device argument specifies an unsupported iPhone555 device. For a list of supported devices, refer to "http://viewportsizes.com"');
                        expect(errs[0]).to.contains(
                            '58 |    expect(await getWindowWidth()).equals(iPhoneSize.height); ' +
                            '59 |    expect(await getWindowHeight()).equals(iPhoneSize.width); ' +
                            '60 |}); ' +
                            '61 | ' +
                            '62 |test(\'Incorrect action device argument\', async t => {' +
                            ' > 63 |    await t.resizeWindowToFitDevice(\'iPhone555\'); ' +
                            '64 |});'
                        );
                    });
            });
        });
    });
}
