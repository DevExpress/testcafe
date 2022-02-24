const { BASE_URL, INDEX1_URL, ABSOLUTE_BASE_URL } = require('./constants')

describe('[Regression](GH-1932)', function () {
    it('The baseUrl should be used as a pageUrl when Fixture and Test page methods are not called', function () {
        return runTests('./testcafe-fixtures/fixture1.js', 'Test page URL is not specified', {
            baseUrl: INDEX1_URL,
        });
    });
    it('The URL specified with the "page" Test method should be used instead of baseUrl', function () {
        return runTests('./testcafe-fixtures/fixture1.js', 'Test page URL is specified', {
            baseUrl: INDEX1_URL,
        });
    });
    it('The URL specified with the "page" Fixture method should be used instead of baseUrl', function () {
        return runTests('./testcafe-fixtures/fixture2.js', 'Fixture page URL is used', {
            baseUrl: BASE_URL,
        });
    });
    it('The pageUrl should be a combination of web baseUrl and relative page url', function () {
        return runTests('./testcafe-fixtures/fixture2.js', 'Test page URL is relative', {
            baseUrl: BASE_URL,
        });
    });
    it('The pageUrl should be a combination of web baseUrl and relative page url with upDir symbol', function () {
        return runTests('./testcafe-fixtures/fixture2.js', 'Test page URL is relative with UpDir symbol', {
            baseUrl: BASE_URL,
        });
    });
    it('The pageUrl should be a combination of physical drive baseUrl and relative page url', function () {
        return runTests('./testcafe-fixtures/fixture3.js', 'Fixture relative url is used', {
             baseUrl: ABSOLUTE_BASE_URL,
        });
    });
    it('The pageUrl should be a combination of physical drive baseUrl and overwritten relative page url', function () {
        return runTests('./testcafe-fixtures/fixture3.js', 'Test page URL is relative', {
            baseUrl: ABSOLUTE_BASE_URL,
        });
    });
    it('The pageUrl should be a combination of physical drive baseUrl and relative page url with upDir symbol', function () {
        return runTests('./testcafe-fixtures/fixture3.js', 'Test page URL is relative with UpDir symbol', {
            baseUrl: ABSOLUTE_BASE_URL,
        });
    });
});
