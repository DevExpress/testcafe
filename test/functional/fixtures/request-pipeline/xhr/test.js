const { errorInEachBrowserContains } = require('../../../assertion-helper.js');

describe('XHR', () => {
    it('Should keep header if request was reopened', () => {
        return runTests('./testcafe-fixtures/index.js', 'Click test header button');
    });

    it('Should not return authorization prefix for the authorization header', () => {
        return runTests('./testcafe-fixtures/index.js', 'Click auth header button');
    });

    it('Should wait for xhr-requests after an action', () => {
        return runTests('./testcafe-fixtures/index.js', 'Click delay button', { shouldFail: true })
            .catch(errs => {
                errorInEachBrowserContains(errs, 'Xhr requests are finished', 0);
            });
    });
});
