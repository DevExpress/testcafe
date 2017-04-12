var errorInEachBrowserContains = require('../../../../assertion-helper.js').errorInEachBrowserContains;


describe('[Raw API] Right click action', function () {
    it('Should make right click on a button', function () {
        return runTests('./testcafe-fixtures/right-click.testcafe', 'Right click simple button', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'Right click on input raised', 0);
            });
    });
});
