const config = require('../../../../config.js');


describe('[API] t.maximizeWindow', function () {
    if (config.useLocalBrowsers) {
        it('Should maximize the window to the maximum available size (Chrome)', function () {
            return runTests('./testcafe-fixtures/maximize-window-test.js', 'Maximize window (Chrome)', { only: 'chrome' });
        });

        it('Should maximize the window to the maximum available size (Other)', function () {
            return runTests('./testcafe-fixtures/maximize-window-test.js', 'Maximize window (Other)', { skip: 'chrome' });
        });
    }
});
