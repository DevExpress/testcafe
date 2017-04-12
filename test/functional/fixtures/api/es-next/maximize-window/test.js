var config = require('../../../../config.js');


describe('[API] t.maximizeWindow', function () {
    if (config.useLocalBrowsers) {
        it('Should maximize the window to the maximum available size', function () {
            return runTests('./testcafe-fixtures/maximize-window-test.js', 'Maximize window');
        });
    }
});
