var errorInEachBrowserContains = require('../../../../assertion-helper.js').errorInEachBrowserContains;


describe('[Raw API] Hover action', function () {
    it('Should make hover on a buttons', function () {
        return runTests('./testcafe-fixtures/hover.testcafe', 'Hover on simple buttons', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'Hover on inputs raised', 0);
            });
    });
});
