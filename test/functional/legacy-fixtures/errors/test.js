const { expect } = require('chai');

describe('Errors', () => {
    it('Should fail on errors', () => {
        return runTests('./testcafe-fixtures/errors.test.js', null, { shouldFail: true, skip: 'iphone,ipad' })
            .catch(errs => {
                expect(errs[0]).contains('A target element of the click action has not been found in the DOM tree.');
            });
    });
});
