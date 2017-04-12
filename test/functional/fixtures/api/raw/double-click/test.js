var errorInEachBrowserContains = require('../../../../assertion-helper.js').errorInEachBrowserContains;


describe('[Raw API] Double click action', function () {
    it('Should make double click on a button', function () {
        return runTests('./testcafe-fixtures/double-click.testcafe', 'Double click simple button', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'Click on input raised 2 times. Double click on input raised', 0);
            });
    });
});
