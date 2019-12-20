const errorInEachBrowserContains = require('../../../../assertion-helper.js').errorInEachBrowserContains;

// NOTE: the whole Selectors API is tested in the es-next tests. The
// goal of this tests - check different types of Selector API constructions
// (like derivative selectors, ClientFunctions, RegExp usage etc..)
describe('[Raw API] Selector', function () {
    it('Should work with different type of selectors', function () {
        return runTests('./testcafe-fixtures/test.testcafe', 'Different types of selectors', { only: 'edge-chromium' });
    });

    it('Should raise an error is selector fails', function () {
        return runTests('./testcafe-fixtures/test.testcafe', 'Incorrect selector', { only: 'edge-chromium', shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'WrongSelector is not defined', 0);
            });
    });
});
