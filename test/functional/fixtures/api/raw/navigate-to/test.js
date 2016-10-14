var errorInEachBrowserContains = require('../../../../assertion-helper.js').errorInEachBrowserContains;


describe('[Raw API] Navigate to action', function () {
    it('Should navigate to a page using a url that contains a protocol', function () {
        return runTests('./testcafe-fixtures/navigate-to.testcafe', 'Navigate to a page using a url that contains a protocol', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'Click raised on page after navigation', 0);
            });
    });

    it('Should navigate to a page using a protocol-relative url', function () {
        return runTests('./testcafe-fixtures/navigate-to.testcafe', 'Navigate to a page using a protocol-relative url', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'Click raised on page after navigation', 0);
            });
    });

    it('Should navigate to a page using a relative url', function () {
        return runTests('./testcafe-fixtures/navigate-to.testcafe', 'Navigate to a page using a relative url', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'Click raised on page after navigation', 0);
            });
    });

    it('Should navigate to the 404-page using a non-existent url', function () {
        return runTests('./testcafe-fixtures/navigate-to.testcafe', 'Navigate to a page using a non-existent url');
    });

    it('Should navigate to the 404-page using an incorrect url', function () {
        return runTests('./testcafe-fixtures/navigate-to.testcafe', 'Navigate to a page using an incorrect url');
    });
});
