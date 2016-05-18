var config = require('../../../../config.js');


if (!config.isTravisTask) {
    describe('[API] Resize window actions', function () {
        describe('t.resizeWindow', function () {
            it('Should resize the window', function () {
                return runTests('./testcafe-fixtures/resize-window-test.js', 'Resize the window');
            });
        });

        describe('t.resizeWindowToFitDevice', function () {
            it('Should resize the window to fit a device', function () {
                return runTests('./testcafe-fixtures/resize-window-test.js', 'Resize the window to fit a device');
            });

            it('Should resize the window to fit a device with portrait orientation', function () {
                return runTests('./testcafe-fixtures/resize-window-test.js', 'Resize the window to fit a device with portrait orientation');
            });
        });
    });
}
